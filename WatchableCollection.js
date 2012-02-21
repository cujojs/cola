/** MIT License (c) copyright B Cavalier & J Hann */

(function(define) {
define(function () {
	"use strict";

	function makeWatchable(collection) {
		var added, updated, removed;

		if(isWatchable(collection)) return collection;

		added   = [];
		updated = [];
		removed = [];

		collection.watch = function(itemAdded, itemUpdated, itemRemoved) {

			itemAdded   && added.push(itemAdded);
			itemUpdated && updated.push(itemUpdated);
			itemRemoved && removed.push(itemRemoved);

			return function() {
				itemAdded   && removeFromArray(added, itemAdded);
				itemUpdated && removeFromArray(updated, itemUpdated);
				itemRemoved && removeFromArray(removed, itemRemoved);
			}
		};

		replaceMethod(collection, 'itemAdded', added);
		replaceMethod(collection, 'itemUpdated', updated);
		replaceMethod(collection, 'itemRemoved', removed);

		return collection;
	}

	makeWatchable.isWatchable = isWatchable;

	function isWatchable(collection) {
		// avoid false positives on gecko's native watch() function:
		return collection
			&& typeof collection.watch == 'function'
			&& collection.watch != Object.prototype.watch;
	}

	function replaceMethod(collection, methodName, listeners) {
		var orig, paused;

		orig = collection[methodName];
		paused = false;

		if(typeof orig == 'function') {
			collection[methodName] = function(item) {
//				if(paused) return;

				paused = true;

				try {
					// TODO: Should we catch exceptions from the original?
					// I say no: let the original behave as it would have before we replaced it.
					var result = orig.apply(collection, arguments);

					notify(listeners, item);
				} finally {
					paused = false;
				}

				return result;
			}
		}
	}

	function notify(callbacks, item) {
		for(var i = 0, len = callbacks.length; i < len; i++) {
			try {
				callbacks[i](item);
			} catch(e) {
				console.error(e);
				// TODO: Handle exceptions for itemAdded/itemUpdated/itemRemoved
			}
		}
	}

	function removeFromArray(arr, item) {
		var i = arr.length - 1;

		for(; i >= 0; --i) {
			if(arr[i] === item) {
				arr.splice(i, 1);
				return;
			}
		}
	}

	return makeWatchable;
});
})(
	typeof define == 'function'
		? define
		: function(factory) { module.exports = factory(); }
);