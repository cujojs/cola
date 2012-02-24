/** MIT License (c) copyright B Cavalier & J Hann */

(function(define) {
define(function (require) {

	"use strict";

	var Notifier, undef;

	Notifier = require('./Notifier');

	// TODO: somehowchange ArrayAdapter to take comparator and keyFunc as properties?
	function ArrayAdapter(dataArray, comparator, keyFunc) {
		this.comparator = comparator || compare;
		this._keyFunc = this.symbolizer = keyFunc || defaultKeyFunc;

		this._data = [];
		this._index = {};

		this._notifier = new Notifier();

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

			if (!(key in index)) {
				index[key] = this._data.push(item) - 1;
				return this._notifier.notify('add', item);
			}
		},

		remove: function(itemOrId) {
			var key, at, item, index, data;

			key = this._keyFunc(itemOrId);
			index = this._index;

			if(key in index) {
				data = this._data;

				at = index[key];
				item = data[at];
				data.splice(at, 1);

				// Rebuild index before notifying
				this._index = buildIndex(data, this._keyFunc);

				return this._notifier.notify('remove', item);
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
