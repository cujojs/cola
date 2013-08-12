define(function(require) {

	var when, fn, qs, init, config, validateTodo, mediate,
		createAdapter, changeAdapter, completeAllAdapter, removeCompletedAdapter,
		queue, transaction, transactional, observe, crudMethodDispatcher,
		objectMethodAdapter, objectEventAdapter, reactiveCollection, reactiveModel,
		bindByAttr;

	// The init module variants bootstrap specific controllers and datasources
	// for plain objects, or backbone, or Rest, etc.
	// See init.js, init-bb.js, init-rest.js
	// NOTE: For more init-rest notes, see server.js
	init = require('./init');

	when = require('when');
	fn = require('when/function');
	validateTodo = require('./validateTodo');
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

	// This is ugly, but need to pass the differ to multiple things
	// Might be nicer to pass metadata instead.
	var differ = datasource.metadata.diff.bind(datasource.metadata);

	// CREATE

	// Create an adapter that routes a dom event to controller.create
	// Pass the differ, so it can compute changes, and pass a list of
	// data "sources" that create() might find useful--the data provided
	// by these will be injected
	// createAdapter is a function which accepts a dom event
	createAdapter = objectEventAdapter(differ, config.controller.create.bind(config.controller), [datasource, todoForm]);

	// Compose an "event stream" that transforms a dom event into a change ("new"
	// in this case), which is used to update the datasource and commit a
	// transaction, and then finally clear the form.
	var createTodo = fn.compose(createAdapter, completeTransaction, todoForm.clear);

	// REMOVE

	// Create an adapter that routes a dom event to controller.remove, injects
	// data from the list of providers, and then detects changes
	// removeAdapter is a function which accepts a dom event
	var removeAdapter = objectEventAdapter(differ, config.controller.remove.bind(config.controller), [datasource, todoList]);

	var removeTodo = fn.compose(removeAdapter, completeTransaction);

	// COMPLETE ALL

	// Create an adapter that routes a dom event to controller.completeAll, and
	// then detects changes. Similar to CREATE, pass the differ and source of data.
	// completeAllAdapter is a function which accepts a dom event
	completeAllAdapter = objectEventAdapter(differ, config.controller.completeAll.bind(config.controller), [datasource]);

	// Compose event stream for completeAll
	var completeAll = fn.compose(completeAllAdapter, completeTransaction);

	// REMOVE ALL COMPLETED

	// Similarly to COMPLETE ALL, create an adapter that routes the dom event
	// to controller.removeCompleted, injects data, and detects changes
	// removeCompletedAdapter is a function which accepts a dom event
	removeCompletedAdapter = objectEventAdapter(differ, config.controller.removeCompleted.bind(config.controller), [datasource]);

	// Compose event stream for removeCompleted
	var removeCompleted = fn.compose(removeCompletedAdapter, completeTransaction);

	// DATA CHANGES

	// This adapter maps CHANGES to CHANGES.  It accepts a change that comes
	// from the view (which is simulated below), routes it to a controller method
	// (controller.update in this case), extracting the relevant data sources
	// (namely the todos collection and updated todo item) from the change record
	// injecting them, and then detecting changes.

	// NOTE: It seems like we will be able to bypass the controller entirely
	// here when using observable views.  For now, I am synthesizing a change
	// record and simply using view.find(e), which returns the non-updated data item,
	// so I route the item through the controller's update() method and watch
	// for changes instead.
	changeAdapter = objectMethodAdapter(crudMethodDispatcher, differ, config.controller);

	var updateTodo = fn.compose(changeAdapter, completeTransaction);

	// Fetch initial data, populate the view, and initialize event handling
	when(datasource.fetch(), function(data) {
		todoList.set(data);
		initEvents();
	});

	// Setup event handling
	function initEvents() {
		qs('.todo-form').addEventListener('submit', function(e) {
			e.preventDefault();
			createTodo(e);
		});

		qs('.todo-list').addEventListener('click', function(e) {
			if(e.target.className === 'remove') {
				removeTodo(e);

			} else if(e.target.classList.contains('toggle')) {
				// This can go away once view.observe is integrated.
				// Synthesize a change record
				var item = todoList.find(e);
				when(datasource.fetch(), function(data) {
					return updateTodo({
						type: 'updated',
						name: findIndexById(datasource.metadata.model.id, data, item),
						object: data,
						oldValue: item
					});
				}).otherwise(function(e) {
					// Just so errors during testing are observable
					console.error(e.stack);
				});
			}
		});

		qs('.todo-form').addEventListener('click', function(e) {
			if(e.target.className === 'remove-completed') {
				removeCompleted(e);
			} else if(e.target.className === 'complete-all') {
				completeAll(e);
			}
		});
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

	// Apply changes to the transactional datasource and commit its transaction
	function completeTransaction(changes) {
		return when(updateTransaction(changes), commitTransaction);
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

});