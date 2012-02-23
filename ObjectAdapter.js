/** MIT License (c) copyright B Cavalier & J Hann */

(function (define) {
define(function (require) {
"use strict";

	var when, stopIteration;

	when = require('when');
	stopIteration = {};

	/**
	 * @constructor
	 * @param obj {Object}
	 * @param options {Object}
	 */
	function ObjectAdapter(obj, options) {

		this._obj = obj;
		this._options = options;
		this._listeners = {};

	}

	ObjectAdapter.prototype = {

		watch: function (name, callback) {
			return listen(this._listeners, name, callback);
		},

		watchAll: function (callback) {
			return listen(this._listeners, '*', callback);
		},

		set: function (name, value) {
			var obj = this._obj;
			if (obj[name] != value) {
				obj[name] = value;
				return when.all([
					notify(this._listeners, value, name),
					notify(this._listeners, value, '*', name) // also notify any wildcard listeners
				]);
			}
		},

		forEach: function (lambda) {
			for (var p in this._obj) {
				lambda(this._obj[p], p);
			}
		},

		getOptions: function () {
			return this._options;
		}

	};

	/**
	 * Tests whether the given object is a candidate to be handled by
	 * this adapter.  Returns true if the object is of type 'object'.
	 * @param obj
	 * @returns {Boolean}
	 */
	ObjectAdapter.canHandle = function (obj) {
		// this seems close enough to ensure that instanceof works.
		// a RegExp will pass as a valid prototype, but I am not sure
		// this is a bad thing even if it is unusual.
		return Object.prototype.toString.call(obj) == '[object Object]';
	};

	return ObjectAdapter;

	/**
	 * Registers a listener and returns a function to unlisten.
	 * Internal implementation of watch/unwatch.
	 * @private
	 * @param name {String}
	 * @param callback {Function}
	 */
	function listen (listeners, name, callback) {
		var list;

		list = listeners[name] || (listeners[name] = []);
		list.push(callback);

		// return unwatch function
		return function () {
			return walkArray(listeners[name], function (item, i, arr) {
				if(item === callback) {
					arr.splice(i, 1);
					return stopIteration;
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
		return when.reduce(listeners[key], function(original, handler) {
			return when(handler(name, original), function() {
				return original;
			})
		}, value);
	}

	/**
	 * Walks a linked list
	 * @private
	 * @param array
	 * @param callback {Function} function (itemInList, callback) {}
	 */
	function walkArray (array, callback) {
		var result, i, len;
		for(i = 0, len = array.length; i < len && result != stopIteration; i++) {
			result = callback(array[i], i, array);
		}
	}

});
}(
	typeof define == 'function'
		? define
		: function (factory) { module.exports = factory(require); }
));