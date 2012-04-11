(function (define) {
define(function () {
"use strict";

	/**
	 * Returns a network strategy that is a composition of two or more
	 * other strategies.  The strategies are executed in the order
	 * in which they're provided.
	 * @param strategies {Array} collection of network strategies.
	 * @returns {strategyFunction} composite network strategy
	 */
	return function composeStrategies (strategies) {
		var len = strategies.length;

		return function (source, dest, data, type, api) {
			var i = 0, proceed;
			do proceed = strategies[i](source, dest, data, type, api);
			while (proceed !== false && ++i < len)
		}

	};

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(); }
));