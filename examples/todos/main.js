define(function(require) {

	var most, when, fn, cb, domReady, qs, init, config, validateTodo, mediate,
		queue, transaction, transactional, observe, reactiveCollection, reactiveModel,
		bindByAttr;

	// The init module variants bootstrap specific controllers and datasources
	// for plain objects, or backbone, or Rest, etc.
	// See init.js, init-bb.js, init-rest.js
	// NOTE: For more init-rest notes, see server.js
	init = require('./init-rest');

	most = require('most');
	when = require('when');
	fn = require('when/function');
	cb = require('when/callbacks');
	domReady = require('curl/domReady');

	mediate = require('cola/mediate');
	transaction = require('cola/data/transaction');
	queue = require('cola/lib/queue');
	reactiveCollection = require('cola/view/array');
	reactiveModel = require('cola/view/model');
	bindByAttr = require('cola/view/bind/byAttr');
	observe = require('cola/data/transaction/observe');

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
	var datasource = transactional(config.datasource);
	var controller = config.controller;

	var mediator = mediate(datasource, controller, todoList);

	when.join(mediator.refresh(), cb.call(domReady)).then(initEvents);

	var online = navigator.onLine;

	// Setup event handling
	function initEvents() {
		most.fromEventTarget(window, 'online').each(function() {
			var wasOffline = !online;
			online = true;
			document.body.classList.remove('offline');
			if(wasOffline && online) {
				commitTransaction();
			}
		});

		most.fromEventTarget(window, 'offline').each(function() {
			online = false;
			document.body.classList.add('offline');
		});

		most.fromEventTarget(qs('.todo-form'), 'submit')
			.tap(preventDefault)
			.map(todoForm.get)
			.map(function(e) {
				console.log(e);
				return controller.create(e);
			})
			.flatMap(most.fromPromise)
			.map(commitIfOnline)
//			.flatMap(most.fromPromise)
			.each(todoForm.clear);

		todoList.observe()
			.map(updateTransaction)
			.flatMap(most.fromPromise)
			.each(commitIfOnline);

		most.fromEventTarget(qs('.todo-list'), 'click')
			.filter(targetHasClass('remove'))
			.map(todoList.find)
			.map(function(x)  {
				return controller.remove(x);
			})
			.flatMap(most.fromPromise)
			.each(commitIfOnline);

		most.fromEventTarget(qs('.todo-form'), 'click')
			.filter(targetHasClass('remove-completed'))
			.map(function(e)  {
				return controller.removeCompleted(e);
			})
			.flatMap(most.fromPromise)
			.each(commitIfOnline);

		most.fromEventTarget(qs('.todo-form'), 'click')
			.filter(targetHasClass('complete-all'))
			.map(function(e)  {
				return controller.completeAll(e);
			})
			.flatMap(most.fromPromise)
			.each(commitIfOnline);
	}

	// Create the todos bard list view
	function createTodoListView(node, metadata) {
		return reactiveCollection(node, {
			sectionName: 'todos',
			sortBy: 'description', // FIXME
			binder: bindByAttr(),
			metadata: metadata
		});
	}

	// Create the todo form view
	function createTodoFormView(node, metadata) {
		return reactiveModel(node, {
			binder: bindByAttr(),
			proxy: metadata.model
		});
	}

	function updateTransaction(changes) {
		return datasource.update(changes);
	}

	function commitIfOnline() {
		if(online) {
			return commitTransaction();
		}
	}

	function commitTransaction() {
		if(typeof datasource.commit === 'function') {
			return datasource.commit();
		}
	}

	function preventDefault(e) {
		e.preventDefault();
	}

	function targetHasClass(cls) {
		return function(e) {
			return e.target.classList.contains(cls);
		};
	}

});