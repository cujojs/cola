/** MIT License (c) copyright B Cavalier & J Hann */

define(function () {
"use strict";

	var undef;

	/**
	 * Decorator that makes an object watchable. Similar to dojo's Stateful.
	 * The original object is unaltered, but an object that inherits from the
	 * original object with the watchable methods (get, set, and watch) is
	 * returned.
	 * @param obj {Object} an object to be made watchable.
	 * @returns {WatchableObject}
	 */
	function makeWatchable (obj) {

		var watchable, listeners;

		// just return the object if it's already watchable
		if (makeWatchable.isWatchable(obj)) return obj;

		watchable = begetWatchable(obj);

		listeners = {};

		/**
		 * Returns a property or attribute of an object.
		 * @param name {String}
		 * @param options {Object}
		 * @returns the value of the property or attribute
		 */
		watchable.get = function (name, options) {
			return obj[name];
		};

		/**
		 * Sets a property or attribute of a obj.
		 * @param name {String}
		 * @param value
		 * @param options {Object}
		 * @returns {Object}
		 */
		watchable.set = function (name, value, options) {
			obj[name] = value;
			notify(value, name);
			notify(value, '*'); // also notify any wildcard listeners
			return obj;
		};

		/**
		 * Watches for data set on the property specified by name
		 * and returns an unwatch function. Note: only property modifications
		 * made through this interface are watchable with this adapter!
		 * @param name {String}
		 * @param callback {Function} function (propValue, propName) {}
		 * @returns {Function} function () {} (no params)
		 */
		watchable.watch = function (name, callback) {
			return listen(name, callback);
		};

		/**
		 * Registers a listener and returns a function to unlisten.
		 * Internal implementation of watch/unwatch.
		 * @private
		 * @param name {String}
		 * @param callback {Function}
		 */
		function listen (name, callback) {
			var list, head;

			list = listeners[name];
			head = { callback: callback, prev: list };
			listeners[name] = head;

			// return unwatch function
			return function () {
				walkList(listeners[name], function (item) {
					if (item == head) {
						listeners[name] = head.prev;
						return walkList.stopSignal;
					}
				});
			};
		}

		/**
		 * Calls all listener functions with the details of a modified
		 * property.
		 * @private
		 * @param value
		 * @param name
		 */
		function notify (value, name) {
			walkList(listeners[name], function (item) {
				item.callback(value, name);
			});
		}

	}

	function WatchableObject () {}
	function begetWatchable (obj){
		var watchable;
		WatchableObject.prototype = obj;
		watchable = new WatchableObject();
		WatchableObject.prototype = undef;
		return watchable;
	}

	/**
	 * Walks a linked list
	 * @private
	 * @param list
	 * @param callback {Function} function (itemInList, callback) {}
	 */
	function walkList (list, callback) {
		var item = list;
		while (item && callback(item) !== walkList.stopSignal) {
			item = item.prev;
		}
	}
	walkList.stopSignal = {};

	/**
	 * Returns true if the object, obj, is watchable. Specify true
	 * for the loose argument if it's acceptable if the object is
	 * Watchable-ish (supports the same methods as Watchable).
	 * @param obj
	 * @param loose {Boolean} optional
	 */
	makeWatchable.isWatchable = function (obj) {
		var loose = arguments[1];
		// avoid false positives on gecko's native watch() function:
		return obj instanceof WatchableObject || (loose && 'watch' in obj && obj.watch != Object.prototype.watch);
	};

	return makeWatchable;

});
