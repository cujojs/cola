/** MIT License (c) copyright B Cavalier & J Hann */

(function (define) {
define(function (require) {
"use strict";

	/**
	 * Decorator that applies transforms to properties flowing in
	 * and out of an ObjectAdapter (or similar).
	 * @param adapter {Object}
	 * @param transforms {Object}
	 */
	function addPropertyTransforms (adapter, transforms) {
		var origForEach, origSet, origWatch;

		// only override if transforms has properties
		if (transforms && hasProperties(transforms)) {

			// keep a reference to original methods
			origForEach = adapter.forEach;
			origSet = adapter.set;
			origWatch = adapter.watch;

			adapter.set = function transformedSet (name, value) {
				var transform = transforms[name]
					|| passthru;
				return origSet.call(adapter, name, transform(value));
			};

			adapter.forEach = function transformedForEach (lambda) {
				// Note: potential performance improvement if we cache the
				// transformed lambdas in a hashmap.
				function transformedLambda (value, name) {
					var reverse = transforms[name]
						&& transforms[name].inverse
						|| passthru;
					return lambda(reverse(value), name);
				}
				return origForEach.call(adapter, transformedLambda);
			};

			adapter.watch = function transformedWatch (name, callback) {
				var reverse = transforms[name]
					&& transforms[name].inverse
					|| passthru;
				function transformedCallback (name, value) {
					return callback(name, reverse(value));
				}
				return origWatch.call(adapter, name, transformedCallback);
			};

		}

		return adapter;
	}

	return addPropertyTransforms;

	function passthru (val) { return val; }

	function hasProperties (obj) {
		for (var p in obj) return true;
	}

});
}(
	typeof define == 'function'
		? define
		: function (factory) { module.exports = factory(require); }
));
