define(function(require) {

	var parse = require('cola/dom/parse');
	var Rest = require('cola/data/Rest');

	parse(document.body, new Rest('http://rest-service.guides.spring.io'),
		function(view, data) {
			data.get().then(view.set.bind(view));
		});
});
