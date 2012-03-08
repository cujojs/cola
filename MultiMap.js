/** MIT License (c) copyright B Cavalier & J Hann */

(function (define) {
define(function () {

	var undef, missing = {};

	/**
	 * @constructor
	 * @param symbolizer
	 * @param comparator
	 */
	function MultiMap (symbolizer, comparator) {

		// Binary search (comparator) and sparse arrays don't mix.
		// Therefore, key items can never be deleted (use splice).
		// Hashmap indexing (symbolizer) and splice don't mix.
		// Therefore, value items can never be spliced (use delete).
		// Index points to value items.

		// list of items that serve as keys. the comparator, if provided,
		// sorts these.
		this._keyItems = [];

		// list of items that are related to the key items. These are organized
		// into a sparse array and are indexed.
		this._valueItems = [];

		// hashmap of symbolized key items to positions of value items.
		this._index = {};

		/**
		 * Fetches a value item for the given key item or the special object,
		 * missing, if the value item was not found.
		 * @private
		 * @param keyItem
		 * @returns {Object} the value item that was set for the supplied
		 * key item or the special object, missing, if it was not found.
		 */
		this._fetch = function (keyItem) {
			var symbol = symbolizer(keyItem);
			return symbol in this._index ? this._index[symbol] : missing;
		};

		/**
		 * Performs a binary search to find the insertion position of a
		 * key item within the key items list.
		 * @private
		 * @param keyItem
		 * @param exact {Boolean} if true, must be an exact match to the key
		 *   item, not just the correct position for a key item that sorts
		 *   the same.
		 * @returns {Number|Undefined}
		 */
		this._pos = function (keyItem, exact) {
			return binarySearch(this._keyItems, keyItem, comparator);
		};
		if (!comparator) {
			this._pos = function (keyItem, exact) {
				if (exact) {
					return linearScan(this._keyItems, keyItem, symbolizer);
				}
				else {
					return this._keyItems.length;
				}
			}
		}

		/**
		 * Given a keyItem and its position in the list of key items,
		 * inserts an value item into the list of value items.
		 * This method can be overridden by other objects that need to
		 * have objects in the same order as the key values.
		 * @private
		 * @param valueItem
		 * @param keyItem
		 * @param pos
		 * @returns {Number} the position in the values list.
		 */
		this._insert = function (keyItem, pos, valueItem) {

			// insert key item
			this._keyItems.splice(pos || this._keyItems.length, 0, keyItem);

			// insert value item and record pos in index
			pos = this._valueItems.push(valueItem) - 1;
			this.index[symbolizer(keyItem)] = pos;

			return pos;
		};

		/**
		 * Given a key item and its position in the list of key items,
		 * removes a value item from the list of value items.
		 * This method can be overridden by other objects that need to
		 * have objects in the same order as the key values.
		 * @private
		 * @param keyItem
		 * @param pos
		 * @returns {Number} the position in the values list.
		 */
		this._remove = function remove (keyItem, pos) {
			var symbol;

			// delete sorted key item
			this._keyItems.splice(pos, 1);

			// find indexed value item
			symbol = symbolizer(keyItem);
			pos = this._index[symbol];

			// delete value item and index
			delete this._valueItems[pos];
			delete this._index[symbol];

			return pos;
		};

	}

	MultiMap.prototype = {

		get: function (keyItem) {
			var valueItem;
			valueItem = this._fetch(keyItem);
			return valueItem == missing ? undef : valueItem;
		},

		set: function (keyItem, valueItem) {
			var pos;

			// don't insert twice. bail if we already have it
			if (this._fetch(keyItem) != missing) return;

			// insert into lists
			pos = this._pos(keyItem);
			this._insert(keyItem, pos, valueItem);

			return valueItem;
		},

		remove: function (keyItem) {
			var valueItem, pos;

			// don't remove if we don't already have it
			valueItem = this._fetch(keyItem);
			if (valueItem == missing) return;

			// find positions of key item
			pos = this._pos(keyItem, true);

			this._remove(pos, keyItem);

			return valueItem;
		},

		forEach: function (lambda) {
			var i, len, keyItem, pos;
			for (i = 0, len = this._valueItems.length; i < len; i++) {
				keyItem = this._keyItems[i];
				pos = this._pos(keyItem, true);
				lambda(this._valueItems[pos], keyItem);
			}
		}

	};


	return MultiMap;

	/**
	 * @param list {Array} sorted array in which to search
	 * @param key anything comparable via < and >
	 * @param comparator {Function} comparator function to use in binary search
	 * @returns {Number|Undefined} returns the index of the key, if found, or
	 *  undefined if the key is not found.
	 */
	function binarySearch (list, key, comparator) {
		var min, max, mid, compare;
		min = 0;
		max = list.length;
		if (max > 0) {
			do {
				mid = Math.floor((min + max) / 2);
				compare = comparator(key, list[mid]);
				// don't use mid +/- 1 or we may miss in-between
				if (compare > 0) min = mid;
				else if (compare < 0) max = mid;
				else return mid;
			}
			while (max - min > 1 && !isNaN(compare));
		}
		return -1;
	}

	/**
	 * @param list {Array} array in which to search
	 * @param key anything comparable via ==
	 * @returns {Number|Undefined} returns the index of the key, if found, or
	 *  undefined if the key is not found.
	 */
	function linearScan(list, key, symbolizer) {
		var i, entry;
		i = list.length;
		while ((entry = list[--i])) {
			if (symbolizer(entry) == symbolizer(key)) return i;
		}
		return -1;
	}

	function broadenSearch (list, startPos, key, comparator, symbolizer) {
		var maxDist, offset, symbol;
		maxDist = Math.max(list.length - startPos - 1, startPos);
		offset = 0;
		symbol = symbolizer(key);
		function equals(key2) {
			return symbol == symbolizer(key2);
		}
		while (offset < maxDist) {
			if (equals(list[startPos + offset])) return startPos + offset;
			if (equals(list[startPos - offset])) return startPos - offset;
			if (comparator(key, list[startPos + offset]) != 0 && comparator(key, list[startPos - offset]) != 0) return -1;
			offset++;
		}
		return -1;
	}

});
}(
	typeof define == 'function'
		? define
		: function (factory) { module.exports = factory(require); }
));
