define(function(require) {

	var sync = require('cola/dom/parse');
	var LocalStorage = require('cola/data/LocalStorage');

	var Controller = require('./Controller');
	var store = new LocalStorage('cola-person',
		{ person: { name: 'Brian', address: {} } });

	var controller = new Controller();

	sync(document.body, store);

	document.querySelector('[data-generate-name]').addEventListener('click', function(e) {
		e.preventDefault();
		controller.generateName(e);
	});

});

