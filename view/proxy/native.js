(function (define) {
define(function (require) {

	var nested = require('./nested');

	return function (options) {
		if (!options) options = {};
		return nested (
			options.getter || getter,
			options.setter || setter,
			options.construct || construct,
			options.missing
		);
	};

	function getter (obj, prop) { return obj[prop]; }

	function setter (obj, prop, value) { return obj[prop] = value; }

	function construct (name, path) {
		if (!isNaN(name)) return [];
		return {};
	}

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));
