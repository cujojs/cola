/** MIT License (c) copyright B Cavalier & J Hann */

(function (define) {
define(function () {
	"use strict";

	return function(propName) {
		return function(obj1, obj2) {
			if(obj1) {
				obj1[propName] = obj2;
			}

			return obj1;
		};
	};

});
}(
	typeof define == 'function'
		? define
		: function (factory) { module.exports = factory(); }
));