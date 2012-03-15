/** MIT License (c) copyright B Cavalier & J Hann */

(function (define) {
define(function () {
	"use strict";

	var undef;

	/**
	 * Creates a transform whose input is an object and whose output
	 * is the value of object[propName] if propName is a String, or
	 * if propName is an Array, the Array.prototype.join()ed values
	 * of all the property names in the Array.
	 * @param propName {String|Array} name(s) of the property(ies) on the input object to return
	 * @return {Function} transform function(object) returns any
	 */
	return function(propName) {
		return typeof propName == 'string'
			? function (object) {
				return object && object[propName];
			}
			: function (object) {
				if (!object) return undef;

				var values, i, len;

				values = [];
				for (i = 0, len = propName.length; i < len; i++) {
					values.push(object[propName[i]]);
				}

				return values.join('');
			};
	};

});
}(
typeof define == 'function'
	? define
	: function (factory) { module.exports = factory(); }
));