/** MIT License (c) copyright B Cavalier & J Hann */

(function(define) {
define(function (require) {

	"use strict";

	var when, undef;

	when = require('when');

	// TODO: somehowchange ArrayAdapter to take comparator and keyFunc as properties?
	function ArrayAdapter(dataArray, comparator, keyFunc) {
		this.comparator = comparator || compare;
		this._keyFunc = this.symbolizer = keyFunc || defaultKeyFunc;

		this._data = [];
		this._index = {};

		this._listeners = {
			added: [],
			removed: []
		};

		if(dataArray && dataArray.length) {
			addAll(this, dataArray);
		}
	}

	ArrayAdapter.prototype = {

		comparator: undef,

		symbolizer: undef,

		// just stubs for now
		getOptions: function () {},

		watch: function(itemAdded, itemRemoved) {
			var added, removed;

			added = this._listeners.added;
			removed = this._listeners.removed;

			itemAdded && added.push(itemAdded);
			itemRemoved && removed.push(itemRemoved);

			return function() {
				itemAdded && removeFromArray(added, itemAdded);
				itemRemoved && removeFromArray(removed, itemRemoved);
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

			if (key in index) {
				throw new Error('ArrayAdapter: item already exists', item);
			} else {
				index[key] = this._data.push(item) - 1;
				return notify(this._listeners.added, item);
			}
		},

		remove: function(itemOrId) {
			var key, at, item, index, data;

			key = this._keyFunc(itemOrId);
			index = this._index;

			if(key in index) {
				data = this._data;
				this._data = [];

				at = index[key];
				item = data[at];
				data.splice(at, 1);

				delete index[key];
				this._index = {};

				// Rebuild index before notifying
				addAll(this, data, at);

				return notify(this._listeners.removed, item);
			} else {
				throw new Error('ArrayAdapter: Cannot remove non-existent item', itemOrId);
			}
		}

	};

	ArrayAdapter.canHandle = function(it) {
		return it && Object.prototype.toString.call(it) == '[object Array]';
	};

	function defaultKeyFunc(item) {
		return typeof item == 'object' ? item.id : item;
	}

	function compare(a, b) {
		return a < b ? -1
			: a > b ? 1
				: 0;
	}

	/**
	 * Adds all the items, starting at the supplied start index,
	 * to the supplied adapter.
	 * @param adapter
	 * @param items
	 * @param [start] {Number}
	 */
	function addAll(adapter, items, start) {
		for(var i = start||0, len = items.length; i < len; i++) {
			adapter.add(items[i]);
		}
	}

	function notify(callbacks, item) {
		return when.reduce(callbacks, function(original, callback) {
			return when(callback(original), function() {
				return original;
			});
		}, item);
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

	return ArrayAdapter;
});

})(
	typeof define == 'function'
		? define
		: function(factory) { module.exports = factory(require); }
);
