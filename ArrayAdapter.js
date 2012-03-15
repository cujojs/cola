/** MIT License (c) copyright B Cavalier & J Hann */

// TODO: Evaluate whether ArrayAdapter should use SortedMap internally to
// store items in sorted order based on its comparator

(function(define) {
define(function (require) {

	"use strict";

	var Notifier, undef;

	Notifier = require('./Notifier');

	/**
	 * Manages a collection of objects taken from the supplied dataArray
	 * @param dataArray {Array} array of data objects to use as the initial
	 * population
	 * @param options.keyFunc {Function} function that returns a key/id for
	 * a data item.
	 * @param options.comparator {Function} comparator function that will
	 * be propagated to other adapters as needed
	 */
	function ArrayAdapter(dataArray, options) {

		if(!options) options = {};

		this._options = options;

		this.comparator = options.comparator;
		this._keyFunc = this.symbolizer = options.symbolizer || defaultKeyFunc;

		this._notifier = new Notifier();

		this._init(dataArray);
	}

	ArrayAdapter.prototype = {

		_init: function(dataArray) {
			this._data = [];
			this._index = {};

			if(dataArray && dataArray.length) {
				addAll(this, dataArray);
			}
		},

		comparator: undef,

		symbolizer: undef,

		// just stubs for now
		getOptions: function () {
			return this._options;
		},

		watch: function(itemAdded, itemRemoved) {
			var unlistenAdd, unlistenRemove, notifier;

			notifier = this._notifier;

			unlistenAdd = notifier.listen('add', itemAdded);
			unlistenRemove = notifier.listen('remove', itemRemoved);

			return function() {
				unlistenAdd();
				unlistenRemove();
			}
		},

		forEach: function(lambda) {
			var i, data, len;

			i = 0;
			data = this._data;
			len = data.length;

			for(; i < len; i++) {
				// TODO: Should we catch exceptions here?
				lambda(data[i]);
			}
		},

		add: function(item) {
			var key, index;

			key = this._keyFunc(item);
			index = this._index;

			if(key in index) return null;

			index[key] = this._data.push(item) - 1;
			return this._notifier.notify('add', item);
		},

		remove: function(itemOrId) {
			var key, at, item, index, data;

			key = this._keyFunc(itemOrId);
			index = this._index;

			if(!(key in index)) return null;

			data = this._data;

			at = index[key];
			item = data[at];
			data.splice(at, 1);

			// Rebuild index before notifying
			this._index = buildIndex(data, this._keyFunc);

			return this._notifier.notify('remove', item);
		}

	};

	ArrayAdapter.canHandle = function(it) {
		return it && Object.prototype.toString.call(it) == '[object Array]';
	};

	function defaultKeyFunc(item) {
		return typeof item == 'object' ? item.id : item;
	}

	/**
	 * Adds all the items, starting at the supplied start index,
	 * to the supplied adapter.
	 * @param adapter
	 * @param items
	 */
	function addAll(adapter, items) {
		for(var i = 0, len = items.length; i < len; i++) {
			adapter.add(items[i]);
		}
	}

	function buildIndex(items, keyFunc) {
		var index, i, len;

		index = {};

		for(i = 0, len = items.length; i < len; i++) {
			index[keyFunc(items[i])] = i;
		}

		return index;
	}

	return ArrayAdapter;
});

})(
	typeof define == 'function'
		? define
		: function(factory) { module.exports = factory(require); }
);
