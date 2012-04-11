(function (define) {
define(function () {

	return function (options) {

		/**
		 * Base network event strategy function.
		 * @type strategyFunction
		 * @private
		 * @param source {Object} the adapter that sourced the event
		 * @param dest {Object} the adapter receiving the event
		 * @param data {Object} any data associated with the event
		 * @param type {String} the type of event
		 * @param api {Object} helpful functions for strategies
		 */
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