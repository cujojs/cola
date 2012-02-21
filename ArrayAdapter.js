/** MIT License (c) copyright B Cavalier & J Hann */

(function(define) {
define(function (require) {

	"use strict";

	var makeWatchable, undef;

	makeWatchable = require('./WatchableCollection');

	function compare(a, b) {
		return a < b
			? -1
			: a > b
				? 1
				: 0;
	}

	function ArrayAdapter(dataArray, comparator, keyFunc) {
		this.comparator = comparator || compare;
		this._keyFunc = keyFunc || defaultKeyFunc;

		this._data = [];
		this._index = {};

		if(dataArray && dataArray.length) {
			addAll(this, dataArray);
		}

		makeWatchable(this);
	}

	ArrayAdapter.prototype = {

		comparator: undef,

		add: function(item) {
			var key, index;

			key = this._keyFunc(item);
			index = this._index;

			if (key in index) {
				throw new Error('ArrayAdapter: item already exists', item);
			} else {
				index[key] = this._data.push(item) - 1;
			}
		},

		remove: function(itemOrId) {
			var key, index, data;

			key = this._keyFunc(itemOrId);
			index = this._index;

			if(key in index) {
				this._data.splice(index[key], 1);

				data = this._data;
				this._data = [];

				delete index[key];
				this._index = {};

				addAll(this, data);
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

	function addAll(adapter, items) {
		for(var i = 0, len = items.length; i < len; i++) {
			adapter.add(items[i]);
		}
	}

	return ArrayAdapter;
});

})(
	typeof define == 'function'
		? define
		: function(factory) { module.exports = factory(require); }
);
