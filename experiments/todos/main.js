define(function(require) {

	var Dom = require('cola/dom/Dom');
	var ProxyClient = require('cola/data/ProxyClient');
	var Synchronizer = require('cola/sync/ShadowSynchronizer');
	var LocalStorage = require('cola/data/LocalStorage');
//	var Rest = require('cola/data/Rest');
//	var JsonPatch = require('cola/data/JsonPatch');

	var controller = require('./Controller');
//	var store = new JsonPatch('/todos');
	var store = new LocalStorage('cola-todos', function() {
		return [];
	});

	var todosView = new Dom(document.querySelector('ul'));
	var todosController = new ProxyClient();
	var controller = todosController.proxy(controller);

	document.querySelector('form').addEventListener('submit', function(e) {
		e.preventDefault();
		controller.add(e);
		e.target.reset();
	});

	document.querySelector('[data-complete-all]').addEventListener('click', function(e) {
		e.preventDefault();
		controller.completeAll(e);
	});

	document.querySelector('[data-remove-completed]').addEventListener('click', function(e) {
		e.preventDefault();
		controller.removeCompleted(e);
	});

	var sync = new Synchronizer([todosView, todosController, store]);
//	store.get().then(sync.set.bind(sync));
	sync.set(store.get());
});

