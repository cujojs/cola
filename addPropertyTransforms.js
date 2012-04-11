/** MIT License (c) copyright B Cavalier & J Hann */

(function (define) {
define(function () {
"use strict";

	/**
	 * Decorator that applies transforms to properties flowing in
	 * and out of an ObjectAdapter (or similar).
	 * @param adapter {Object}
	 * @param transforms {Object}
	 */
	function addPropertyTransforms (adapter, transforms) {
		var origGet, origAdd, origUpdate, origForEach;

		// only override if transforms has properties
		if (transforms && hasProperties(transforms)) {

			origGet = adapter.get;
			origAdd = adapter.add;
			origUpdate = adapter.update;
			origForEach = adapter.forEach;

			adapter.get = function transformedGet (id) {

			};

			adapter.add = function transformedAdd (item) {

			};

			adapter.update = function transformedUpdate (item) {
				var transform = transforms[name]
					|| identity;
				return origSet.call(adapter, name, transform(value, name));
			};

			adapter.forEach = function transformedForEach (lambda) {
				// Note: potential performance improvement if we cache the
				// transformed lambdas in a hashmap.
				function transformedLambda (value, name) {
					var reverse = transforms[name]
						&& transforms[name].inverse
						|| identity;
					return lambda(reverse(value, name), name);
				}

				return origForEach.call(adapter, transformedLambda);
			};

		}

		return adapter;
	}

	return addPropertyTransforms;

	function identity (val) { return val; }

	function hasProperties (obj) {
		for (var p in obj) return true;
	}

	function transformItem (item, transforms) {
		var transformed, transform;

		transformed = {};
		for (var name in item) {
			if (name in transforms) {
				transform  = transforms[name] || identity;
				transformed[name] = transform(item[name], name);
			}
		}

		return transformed;
	}

	function reverseItem (item, transforms) {

	}

});
}(
	typeof define == 'function'
		? define
		: function (factory) { module.exports = factory(); }
));
