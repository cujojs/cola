(function (define) {
define(function () {

	/**
	 * ***** This is just a sample. *****
	 */

	var thisStrategy = {};

	return function configureStrategy (options) {
		var option1, option2;

		option1 = options.option1;
		option2 = options.option2;

		return function (source, dest, data, type, api) {
			if (source == thisStrategy) return;
			if ('partial' == type) {
				if (option1 && dest == api.beforeSending) {
					return false;
				}
				else if (!option2 && dest == api.afterSending) {
					return false;
				}
			}
		};
	};

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(); }
));