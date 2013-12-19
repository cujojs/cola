define(function(require) {

	var sync = require('cola/dom/parse');
	var LocalStorage = require('cola/data/LocalStorage');
	var Synchronizer = require('cola/data/ShadowSynchronizer');
	var ProxyClient = require('cola/data/ProxyClient');
	var todosController = require('./todosController');

	var when = require('when');

	var store = new LocalStorage('cola-sync', {
		person: { address: {} },
		todos: []
	});

	var controllers = {
		todos: todosController
	};

	sync(document.body, store, function(path, view, data) {
		var clients = [view, data];
		var controller = controllers[path];

		if(controller) {
			var proxy = new ProxyClient();
			controllers[path] = proxy.proxy(controller);
			clients.push(proxy);
		}

		var s = new Synchronizer(clients);
		return when(data.get(), function(data) {
			return s.set(data);
		});
	}).done(function() {
		var controller = controllers.todos;
		on('.create-todo', 'submit', function(e) {
			e.preventDefault();
			controller.add(e);
			e.target.reset();
		});

		on('[data-complete-all]', 'click', function(e) {
			e.preventDefault();
			controller.completeAll(e);
		});

		on('[data-remove-completed]', 'click', function(e) {
			e.preventDefault();
			controller.removeCompleted(e);
		});

	});

	function on(query, event, handler) {
		document.querySelector(query).addEventListener(event, handler, false);
	}
});

