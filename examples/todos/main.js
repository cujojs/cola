define(function(require) {

	var most, when, fn, domReady, qs, init, config, validateTodo, mediate,
		queue, transaction, transactional, observe, crudMethodDispatcher,
		objectMethodAdapter, objectEventAdapter, reactiveCollection, reactiveModel,
		bindByAttr;

	// The init module variants bootstrap specific controllers and datasources
	// for plain objects, or backbone, or Rest, etc.
	// See init.js, init-bb.js, init-rest.js
	// NOTE: For more init-rest notes, see server.js
	init = require('./init');

	most = require('most');
	when = require('when');
	fn = require('when/function');
	domReady = require('curl/domReady');

	mediate = require('cola/mediate');
	transaction = require('cola/data/transaction');
	queue = require('cola/lib/queue');
	reactiveCollection = require('cola/view/array');
	reactiveModel = require('cola/view/model');
	bindByAttr = require('cola/view/bind/byAttr');
	observe = require('cola/data/transaction/observe');
	objectEventAdapter = require('cola/data/transaction/eventAdapter');
	objectMethodAdapter = require('cola/data/transaction/objectMethodAdapter');
	crudMethodDispatcher = require('cola/data/transaction/crudMethodDispatcher');

	validateTodo = require('./validateTodo');

	qs = document.querySelector.bind(document);

	// Configure the controller and datasource.
	config = init(validateTodo);

	// Wrap the list and form in views
	var todoList = createTodoListView(qs('.todo-list'), config.datasource.metadata);
	var todoForm = createTodoFormView(qs('.todo-form'), config.datasource.metadata);

	// Make the datasource transactional and setup the todoList to observe
	// the transaction outcome
	transactional = transaction(queue());
	var datasource = observe(todoList, transactional(config.datasource));

	// Fetch initial data, populate the view, and initialize event handling
	most.fromArray(datasource.fetch()).each(todoList.add);
//	todoList.set(most.fromArray(datasource.fetch()));
	domReady(initEvents);
//	initEvents();

	// Setup event handling
	function initEvents() {
		formCreateStream(qs('.todo-form'), todoForm)
			.map(function(todo)  {
				return [todo, datasource.fetch()];
			})
			.flatMap(function(newTodoAndTodos) {
				return most.fromPromise(when(newTodoAndTodos[1], function(todos) {
					var diff = datasource.metadata.diff(todos);

					// This is the only data or application specific code here
					var todo = newTodoAndTodos[0];
					todo.id = defaultId();
					todo.created = Date.now();
					todos.push(todo);

					return diff(todos);
				}));
			})
			.map(completeTransaction)
			.each(todoForm.clear);

		most.fromEventTarget(qs('.todo-list'), 'click')
			.filter(function(e) { return e.target.classList.contains('remove'); })
			.map(todoList.find)
			.map(function(todo)  {
				return [todo, datasource.fetch()];
			})
			.flatMap(function(todoAndTodos) {
				return most.fromPromise(when(todoAndTodos[1], function(todos) {
					var diff = datasource.metadata.diff(todos);

					// This is the only data or application specific code here
					var todo = todoAndTodos[0];
					todos.some(function(t, i, todos) {
						if(t.id === todo.id) {
							todos.splice(i, 1);
							return true;
						}
					});

					return diff(todos);
				}));
			})
			.each(completeTransaction);


		most.fromEventTarget(qs('.todo-list'), 'change')
			.filter(function(e) { return e.target.classList.contains('toggle'); })
			.map(todoList.find)
			.map(function(todo) {
				return [todo, datasource.fetch()]
			})
			.flatMap(function(todoAndTodos) {
				return most.fromPromise(when(todoAndTodos[1], function(todos) {
					var todo = todoAndTodos[0];

					// Synthesizing a change record that should have come
					// from the view, i.e. this would be automagic
					todo.completed = !todo.completed;
					var name = findIndexById(datasource.metadata.model.id, todos, todo);
					var object = {};
					object[name] = todo;
					return [{
						type: 'updated',
						name: name,
						object: object,
						oldValue: todos[name]
					}];

				}));
			})
			.each(completeTransaction);

		most.fromEventTarget(qs('.todo-form'), 'click')
			.filter(function(e) { return e.target.classList.contains('remove-completed'); })
			.map(function()  {
				return datasource.fetch();
			})
			.map(function(todos) {
				var diff = datasource.metadata.diff(todos);

				// This is the only data or application specific code here
				todos = todos.filter(function(todo) {
					return !todo.completed;
				});

				return diff(todos);
			})
			.each(completeTransaction);

		most.fromEventTarget(qs('.todo-form'), 'click')
			.filter(function(e) { return e.target.classList.contains('complete-all'); })
			.flatMap(function()  {
				return most.of(datasource.fetch());
			})
			.map(function(todos) {
				var diff = datasource.metadata.diff(todos);

				// This is the only data or application specific code here
				todos = todos.map(function(todo) {
					todo.completed = true;
					return todo;
				});

				return diff(todos);
			})
			.each(completeTransaction);

	}

	// Create the todos bard list view
	function createTodoListView(node, metadata) {
		return reactiveCollection(node, {
			sectionName: 'todos',
			sortBy: 'created', // FIXME
			binder: bindByAttr(),
			proxy: metadata.model
		});
	}

	// Create the todo form view
	function createTodoFormView(node, metadata) {
		return reactiveModel(node, {
			binder: bindByAttr(),
			proxy: metadata.model
		});
	}

	var id = 1;

	function formCreateStream(node, view) {
		return most.fromEventTarget(node, 'submit')
			.tap(preventDefault).map(view.get);
	}

	function defaults(hash) {
		return function(obj) {
			return Object.keys(hash).reduce(function(obj, key) {
				var value;
				if(!(key in obj)) {
					value = hash[key];
					obj[key] = typeof value === 'function' ? value() : value;
				}
				return obj;
			},obj);
		}
	}

	function defaultId() {
		return '' + Date.now() + id++;
	}

	// Apply changes to the transactional datasource and commit its transaction
	function completeTransaction(changes) {
		return when(updateTransaction(changes), commitTransaction);
//		return when(changes, updateTransaction).then(commitTransaction);
	}

	function updateTransaction(changes) {
		return datasource.update(changes);
	}

	function commitTransaction() {
		if(typeof datasource.commit === 'function') {
			return datasource.commit();
		}
	}

	// This is used when synthesizing a change record above.  It can go away
	// once view.observe is integrated.
	function findIndexById(id, array, itemToFind) {
		var found = -1;
		array.some(function(item, i) {
			if(id(item) === id(itemToFind)) {
				found = i;
				return true;
			}
		});

		return found;
	}

	function preventDefault(e) {
		e.preventDefault();
	}

});