/** MIT License (c) copyright B Cavalier & J Hann */

(function (define) {
define(function () {
"use strict";

	/**
	 * @constructor
	 * @param obj {Object}
	 * @returns {Watchable}
	 */
	function ObjAdapter(obj) {

		this._obj = obj;
		this._listeners = {};

		// set blank bindings
		this.setBindings({});
	}

	ObjAdapter.prototype = {

		watch: function (name, callback) {
			return listen(this._listeners, name, callback);
		},

		watchAll: function (callback) {
			return listen(this._listeners, '*', callback);
		},

//		get: function (name) {
//			return this._obj[name];
//		},

		set: function (name, value) {
			var obj = this._obj;
			if (obj[name] != value) {
				obj[name] = value;
				notify(this._listeners, value, name);
				notify(this._listeners, value, '*', name); // also notify any wildcard listeners
			}
		},

		syncTo: function (adapter) {
			for (var p in this._obj) {
				adapter.set(this._obj[p]);
			}
		},

		/**
		 * Sets the binding info for this object.
		 * TODO: do something with these bindings
		 * @param bindings
		 */
		setBindings: function (bindings) {
			this._bindings = bindings;
		}

	};

	/**
	 * Tests whether the given object is a candidate to be handled by
	 * this adapter.  Returns true if the object is of type 'object'.
	 * @param obj
	 * @returns {Boolean}
	 */
	ObjAdapter.canHandle = function (obj) {
		// this seems close enough to ensure that instanceof works.
		// a RegExp will pass as a valid prototype, but I am not sure
		// this is a bad thing even if it is unusual.
		return obj && typeof obj == 'object';
	};

	return ObjAdapter;

	/**
	 * Registers a listener and returns a function to unlisten.
	 * Internal implementation of watch/unwatch.
	 * @private
	 * @param name {String}
	 * @param callback {Function}
	 */
	function listen (listeners, name, callback) {
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
	 * @param key
	 */
	function notify (listeners, value, key, name) {
		if (arguments.length < 3) name = key;
		walkList(listeners[key], function (item) {
			item.callback(name, value);
		});
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

});
}(
	typeof define == 'function'
		? define
		: function (factory) { module.exports = factory(); }
));