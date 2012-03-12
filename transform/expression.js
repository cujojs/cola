/** MIT License (c) copyright B Cavalier & J Hann */

(function (define, globalEval) {
define(function () {
"use strict";

	/**
	 * Creates a function that can be used to evaluate arbitrary expressions
	 * on a data item.
	 * @param options {Object}
	 * @returns {Function} function (value, item) {}
	 * @description
	 */
	return function expressionTransform (value, propName, item, expression) {
		try {
			return globalEval.call(expression, value, propName, item);
		}
		catch (ex) {
			return ex.message;
		}
	};

});
}(
	typeof define == 'function'
		? define
		: function (factory) { module.exports = factory(); },
	function (value, propName, item) {
		var window, document;
		// the only variables in scope are value, item, and any globals
		// not listed in the var statement above. we have to cast to string
		// because of "oddities" between `eval` and `this`.
		return eval('' + this);
	}
));