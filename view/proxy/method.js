(function (define) {
define(function (require) {

	var nested = require('./nested');

	function method (options) {
		var getterName, setterName;

		if (!options) options = {};
		getterName = options.getterName || 'get';
		setterName = options.setterName || 'set';

		return nested (
			options.getter || getter,
			options.setter || setter,
			options.construct,
			options.missing
		);

		function getter (obj, path) {
			return obj[getterName](path);
		}

		function setter (obj, path, value) {
			return obj[setterName](path, value);
		}

	}

	return method;

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));
