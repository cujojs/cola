define(function(require) {

	var Dom = require('cola/dom/Dom');
	var ProxyClient = require('cola/data/ProxyClient');
	var LocalStorage = require('cola/data/LocalStorage');
	var Synchronizer = require('cola/sync/ShadowSynchronizer');
	var getValues = require('cola/dom/form').getValues;

	var controller = require('./controller');

	var store = new LocalStorage('cola-keyValues', [], controller.uniqueId);

	var thingsView = new Dom(document.querySelector('[data-path="things"]'));
	var thingsEditor = new ProxyClient(controller.uniqueId);
	controller = thingsEditor.proxy(controller);

	document.querySelector('[data-add-thing]').addEventListener('submit', function(e) {
		var form;
		e.preventDefault();
		form = e.target;
		controller.add(getValues(form));
		form.reset();
	});

	document.body.addEventListener('click', function(e) {
		var form;
		if(e.target.webkitMatchesSelector('[data-remove-thing]')) {
			e.preventDefault();
			form = e.target.parentNode;
			controller.remove(getValues(form));
		}
	});

	var sync = new Synchronizer([thingsView, store, thingsEditor]);
	sync.set(store.get());

});

