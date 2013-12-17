define(function(require) {

	var sync = require('cola/dom/parse');
	var Rest = require('cola/data/Rest');

	sync(document.body, new Rest('http://rest-service.guides.spring.io'));
});
