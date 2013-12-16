define(function(require) {

	var Dom = require('cola/dom/Dom');
	var ProxyClient = require('cola/data/ProxyClient');
	var Synchronizer = require('cola/data/Synchronizer');
	var LocalStorage = require('cola/data/LocalStorage');

	var Controller = require('./Controller');
	var store = new LocalStorage('cola-person', function() {
		return {
			name: 'Brian',
			address: {}
		};
	});

	var personView = new Dom(document.querySelector('[data-path="person"]'));
	var personProxy = new ProxyClient();
	var controller = personProxy.proxy(new Controller());

	var sync = new Synchronizer([personView, personProxy, store]);
	sync.set(store.get());

	document.querySelector('[data-generate-name]').addEventListener('click', function(e) {
		e.preventDefault();
		controller.generateName(e);
	});

});

