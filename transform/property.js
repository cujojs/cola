/** MIT License (c) copyright B Cavalier & J Hann */

(function (define) {
define(function () {
	"use strict";

	/**
	 * Creates a transform whose input is an object and whose output
	 * is the value of object[propName]
	 * @param propName {String} name of the property on the input object to return
	 * @return {Function} transform function(object) returns any
	 */
	return function(propName) {
		return function(object) {
			return object && object[propName];
		};
	};

});
}(
typeof define == 'function'
	? define
	: function (factory) { module.exports = factory(); }
));