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

			if (origGet) {
				adapter.get = function transformedGet (id) {
					return transformItem(origGet.call(adapter, id), transforms, true);
				};
			}

			if (origAdd) {
				adapter.add = function transformedAdd (item) {
					return origAdd.call(adapter, transformItem(item, transforms, true));
				};
			}

			if (origUpdate) {
				adapter.update = function transformedUpdate (item) {
					return origUpdate.call(adapter, transformItem(item, transforms, true));
				};
			}

			if (origForEach) {
				adapter.forEach = function transformedForEach (lambda) {
					// Note: potential performance improvement if we cache the
					// transformed lambdas in a hashmap.
					function transformedLambda (item, key) {
						var inverted = transformItem(item, transforms, true);
						return lambda(inverted, key);
					}

					return origForEach.call(adapter, transformedLambda);
				};
			}

		}

		return adapter;
	}

	return addPropertyTransforms;

	function identity (val) { return val; }

	function hasProperties (obj) {
		for (var p in obj) return true;
	}

	function transformItem (item, transforms, inverse) {
		var transformed, transform;

		// only create an object if one was found
		transformed = item && {};

		// loop through properties. should we use hasOwnProperty()?
		for (var name in item) {
			if (name in transforms) {
				transform = (inverse
					? transforms[name] && transforms[name].inverse
					: transforms[name]) || identity;
				transformed[name] = transform(item[name], name);
			}
		}

		return transformed;
	}

});
}(
	typeof define == 'function'
		? define
		: function (factory) { module.exports = factory(); }
));
