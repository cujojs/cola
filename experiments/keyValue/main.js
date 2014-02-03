define(function(require) {
	var LocalStorage = require('cola/data/LocalStorage');

	return {
		thingsController: require('./controller'),
		thingsModel: new LocalStorage('key-value', [])
//		thingsModel: []
	};
});

