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

		itemAdded: function(item) {
			var key, index;

			key = this._keyFunc(item);
			index = this._index;

			if (key in index) {
				throw new Error('ArrayAdapter: item already exists', item);
			} else {
				index[key] = this._data.push(item) - 1;
//				binarySearch(this._data, item, this.comparator,
//					function() { },
//					function(item, at, data) {
//						data.splice(at, 0, item);
//						index[key] = at;
//					}
//				);
			}
		},

		itemUpdated: function(item) {
			var key, index;

			key = this._keyFunc(item);
			index = this._index;

			if(key in index) {
				this._data[index[key]] = item;
			} else {
				console.log(item);
				throw new Error('ArrayAdapter: cannot update item', item);
			}
		},

		itemRemoved: function(itemOrId) {
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
			}
		}

	};

	function defaultKeyFunc(item) {
		return typeof item == 'object' ? item.id : item;
	}

	function addAll(adapter, items) {
		for(var i = 0, len = items.length; i < len; i++) {
			adapter.itemAdded(items[i]);
		}
	}

//	function binarySearch(arr, item, comparator, found, notFound) {
//
//		var min, max, mid, compare;
//
//		if(!arr.length) {
//			return notFound(item, 0, arr);
//		}
//
//		min = 0;
//		max = arr.length - 1;
//		mid = Math.floor((min + max) / 2);
//
//		while(min < max) {
//			compare = comparator(item, arr[mid]);
//			if(compare < 0) {
//				max = mid - 1;
//			} else if(compare > 0) {
//				min = mid + 1;
//			} else {
//				return found(item, mid, arr);
//			}
//
//			mid = Math.floor((min + max) / 2);
//		}
//
//		compare = comparator(item, arr[mid]);
//		if(compare == 0) {
//			return found(item, mid, arr);
//		} else {
//			return notFound(item, compare < 0 ? mid : mid+1, arr);
//		}
//	}

	return ArrayAdapter;
});

})(
	typeof define == 'function'
		? define
		: function(factory) { module.exports = factory(require); }
);
