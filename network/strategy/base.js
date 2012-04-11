(function (define) {
define(function () {

	/**
	 * Creates a base strategy function.
	 * @param options {Object} not currently used
	 * @return {Function} a strategy function
	 */
	return function (options) {

		return function baseStrategy (source, dest, data, type, api) {
			if (type in dest && source != dest) {
				if (typeof dest[type] != 'function') {
					throw new Error('Hub: ' + type + ' is not a function.');
				}
				dest[type](data);
			}
		};

	};

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(); }
));