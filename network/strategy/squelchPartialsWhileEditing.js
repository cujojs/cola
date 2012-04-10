(function (define) {
define(function (require) {

	/**
	 * ***** This is just a sample. *****
	 */

	var Hub = require('../Hub'),
		thisStrategy = {};

	return function configureStrategy (options) {
		var option1, option2;

		option1 = options.option1;
		option2 = options.option2;

		return function (source, dest, data, type) {
			if (source == thisStrategy) return;
			if ('partial' == type) {
				if (option1 && dest == Hub.beforeSending) {
					return false;
				}
				else if (!option2 && dest == Hub.afterSending) {
					return false;
				}
			}
		};
	};

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));