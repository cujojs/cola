define(function(require) {

	var when, fn, qs, init, config, validateTodo, mediate,
		createAdapter, changeAdapter, completeAllAdapter, removeCompletedAdapter,
		queue, transaction, transactional, observe;

	init = require('./init');

	when = require('when');
	fn = require('when/function');
	validateTodo = require('./validateTodo');
	mediate = require('cola/mediate');
	transaction = require('cola/data/transaction');
	queue = require('cola/lib/queue');
	observe = require('cola/data/transaction/observe');

	var objectEventAdapter = require('cola/data/transaction/eventAdapter');
	var objectMethodAdapter = require('cola/data/transaction/objectMethodAdapter');
	var crudMethodDispatcher = require('cola/data/transaction/crudMethodDispatcher');

	transactional = transaction(queue());

	qs = document.querySelector.bind(document);

	config = init(qs('.todo-list'), qs('.todo-form'), validateTodo);

	var datasource = observe(config.todoList, transactional(config.datasource));
	var differ = datasource.metadata.diff.bind(datasource.metadata);

	createAdapter = objectEventAdapter(differ, config.controller.create.bind(config.controller), [datasource, config.todoForm]);

	var createTodo = fn.compose(createAdapter, completeTransaction, config.todoForm.clear);

	completeAllAdapter = objectEventAdapter(differ, config.controller.completeAll.bind(config.controller), [datasource]);

	var completeAll = fn.compose(completeAllAdapter, completeTransaction);

	removeCompletedAdapter = objectEventAdapter(differ, config.controller.removeCompleted.bind(config.controller), [datasource]);

	var removeCompleted = fn.compose(removeCompletedAdapter, completeTransaction);

	changeAdapter = objectMethodAdapter(crudMethodDispatcher, differ, config.controller);

	var updateTodo = fn.compose(changeAdapter, completeTransaction);

	when(config.datasource.fetch(), function(data) {
		config.todoList.set(data);
		initEvents();
	});

	function initEvents() {
		qs('.todo-form').addEventListener('submit', function(e) {
			e.preventDefault();
			createTodo(e);
		});

		qs('.todo-list').addEventListener('click', function(e) {
			var item = config.todoList.find(e);
			if(e.target.className === 'remove') {
				when(config.datasource.fetch(), function(data) {
					return updateTodo({
						type: 'deleted',
						name: findIndexById(config.datasource.metadata.model.id, data, item),
						object: data,
						oldValue: item
					});

				})

			} else if(e.target.classList.contains('toggle')) {
				when(config.datasource.fetch(), function(data) {
					return updateTodo({
						type: 'updated',
						name: findIndexById(config.datasource.metadata.model.id, data, item),
						object: data,
						oldValue: item
					});
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