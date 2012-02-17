/** MIT License (c) copyright B Cavalier & J Hann */

define(function () {
	"use strict";

	var undef;

	function PersistentArray(dataArray, keyFunc) {
		this._keyFunc = keyFunc || defaultKeyFunc;
		this._data = dataArray;
		this._index = createIndex(dataArray, keyFunc);
	}

	PersistentArray.prototype = {

		add: function(item) {
			var key, index, at;

			index = this._index;
			key = this._keyFunc(item);

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

			index = this._index;
			key = this._keyFunc(item);

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

			index = this._index;
			key = this._keyFunc(itemOrId);

			if(key in index) {
				at = index[key];
				this._data.splice(index[key], 1);
				delete index[key];
			}

			return at;
		}

	};

	function defaultKeyFunc(item) {
		return item.id;
	}

	function createIndex(dataArray, keyFunc) {
		var index, i, len;

		index = {};
		i = 0;
		len = dataArray.length;

		for(;i < len; i++) {
			index[keyFunc(dataArray[i])] = i;
		}
	}

	return PersistentArray;
});
