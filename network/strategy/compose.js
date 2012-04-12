(function (define) {
define(function () {
"use strict";

	/**
	 * Returns a network strategy that is a composition of two or more
	 * other strategies.  The strategies are executed in the order
	 * in which they're provided.  If any strategy cancels, the remaining
	 * strategies are never executed and the cancel is sent back to the Hub.
	 *
	 * @param strategies {Array} collection of network strategies.
	 * @return {Function} a composite network strategy function
	 */
	return function composeStrategies (strategies) {
		var len = strategies.length;

		return function (source, dest, data, type, api) {
			var i = 0, proceed;

			do proceed = strategies[i](source, dest, data, type, api);
			while (proceed !== false && ++i < len);

			return proceed;
		}

	};

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(); }
));