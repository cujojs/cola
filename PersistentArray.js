/** MIT License (c) copyright B Cavalier & J Hann */

(function(define) {
define(function () {

	"use strict";

	var undef;

	function PersistentArray(dataArray, keyFunc) {
		this._keyFunc = keyFunc || defaultKeyFunc;
		this._data = dataArray;
		this._index = createIndex(dataArray, this._keyFunc);
	}

	PersistentArray.prototype = {

		add: function(item) {
			var key, index, at;

			at = -1;

			key = this._keyFunc(item);
			index = this._index;

			if (key in index) {
				// throw?
			} else {
				at = this._data.push(item) - 1;
				index[key] = at;
			}

			return at;
		},

		get: function(id) {
			var index = this._index;
			return (id in index) ? this._data[index[id]] : undef;
		},

		update: function(item) {
			var key, index, at;

			at = -1;

			key = this._keyFunc(item);
			index = this._index;

			if(key in index) {
				at = index[key];
				this._data[at] = item;
			} else {
				// throw?
			}

			return at;
		},

		remove: function(itemOrId) {
			var key, index, at;

			at = -1;
			key = this._keyFunc(itemOrId);
			index = this._index;

			if(key in index) {
				at = index[key];
				this._data.splice(at, 1);
				delete index[key];

				this._index = createIndex(this._data, this._keyFunc, at);
			}

			return at;
		}

	};

	function defaultKeyFunc(item) {
		return typeof item == 'object' ? item.id : item;
	}

	function createIndex(dataArray, keyFunc, startIndex) {
		var index, i, len;

		index = {};
		i = startIndex || 0;
		len = dataArray.length;

		for(;i < len; i++) {
			index[keyFunc(dataArray[i])] = i;
		}

		return index;
	}

	return PersistentArray;
});

})(
	typeof define == 'function'
		? define
		: function(factory) { module.exports = factory(); }
);
