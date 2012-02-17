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

		replaceMethod(collection, 'add', added);
		replaceMethod(collection, 'update', updated);
		replaceMethod(collection, 'remove', removed);

		return collection;
	}

	makeWatchable.isWatchable = isWatchable;

	function isWatchable(collection) {
		// avoid false positives on gecko's native watch() function:
		return 'watch' in collection && collection.watch != Object.prototype.watch;
	}

	function replaceMethod(collection, methodName, listeners) {
		var orig = collection[methodName];

		if(typeof orig == 'function') {
			collection[methodName] = function(item) {
				var at = orig.call(collection, arguments);

				if(at >= 0) {
					notify(listeners, item, at);
				}
			}
		}
	}

	function notify(callbacks, item, at) {
		for(var i = 0, len = callbacks.length; i < len; i++) {
			callbacks[i](item, at);
		}
	}

	function removeFromArray(arr, item) {
		var i = arr.length;

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