/** MIT License (c) copyright B Cavalier & J Hann */

(function(define) {
define(function () {

	"use strict";

	var undef;

	function ArrayAdapter(dataArray, comparator, keyFunc) {
		this.comparator = comparator || compare;
		this._keyFunc = keyFunc || defaultKeyFunc;

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

		syncTo: function(collectionAdapter) {
			var i, data, len;

			i = 0;
			data = this._data;
			len = data.length;

			for(; i < len; i++) {
				// TODO: Should we catch exceptions here for pre-existing items?
				collectionAdapter.add(data[i]);
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
				notify(this._listeners.added, item);
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

				notify(this._listeners.removed, item);
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
		for(var i = 0, len = callbacks.length; i < len; i++) {
			try {
				callbacks[i](item);
			} catch(e) {
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

	return ArrayAdapter;
});

})(
	typeof define == 'function'
		? define
		: function(factory) { module.exports = factory(); }
);
