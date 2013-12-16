define(function(require) {

	var Dom = require('cola/dom/Dom');
	var ProxyClient = require('cola/data/ProxyClient');
	var Synchronizer = require('cola/data/Synchronizer');

	var controller = require('./Controller');

	var things = {};

	var thingsView = new Dom(document.querySelector('[data-path="things"]'));
	var thingsEditor = new ProxyClient();
	controller = thingsEditor.proxy(controller);

	document.querySelector('[data-add-thing]').addEventListener('submit', function(e) {
		e.preventDefault();
		controller.add(e);
	});

	var sync = new Synchronizer([thingsView, thingsEditor]);
	sync.set(things);
});

