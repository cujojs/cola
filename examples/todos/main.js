define(function(require) {

	var qs, init, config, validateTodo, mediate, mediator,
		queue, transaction, transactional, timeout;

	init = require('./init-bb');
	validateTodo = require('./validateTodo');
	mediate = require('cola/mediate');
	transaction = require('cola/data/transaction');
	queue = require('cola/lib/queue');

	transactional = transaction(queue());

	qs = document.querySelector.bind(document);

	config = init(qs('.todo-list'), qs('.todo-form'), validateTodo);

	qs('.todo-form').addEventListener('submit', function(e) {
		e.preventDefault();
		config.controller.createTodo(config.todoForm.get())
			.then(function() {
				config.todoForm.clear();
				scheduleSync();
			}
		);
	});

	qs('.todo-list').addEventListener('click', function(e) {
		if(e.target.className === 'remove') {
			config.controller.removeTodo(config.todoList.find(e))
				.then(scheduleSync);
		} else if(e.target.classList.contains('toggle')) {
			config.controller.updateTodo(config.todoList.find(e))
				.then(scheduleSync);
		}
	});

	qs('.todo-form').addEventListener('click', function(e) {
		if(e.target.className === 'remove-completed') {
			config.controller.removeCompleted().then(scheduleSync);
		} else if(e.target.className === 'complete-all') {
			config.controller.completeAll().then(scheduleSync);
		}
	});

	mediator = mediate(transactional(config.datasource),
		config.controller, config.todoList);
	mediator.refresh();

	function sync() {
		if(typeof config.datasource.sync === 'function') {
			return config.datasource.sync();
		}
	}

	function scheduleSync() {
		if(timeout == null) {
			timeout = setTimeout(function() {
				timeout = null;
				sync();
			}, 1000);
		}
	}


});