/** MIT License (c) copyright B Cavalier & J Hann */

(function (define) {
define(function () {

	var undef, missing = {};

	/**
	 * @constructor
	 * @param symbolizer {Function}
	 * @param comparator {Function}
	 */
	function SortedHash (symbolizer, comparator) {

		// symbolizer is required, comparator is optional

		// hashmap of object-object pairs
		this._index = {};

		// 2d array of objects
		this._sorted = [];

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
		 * key item within the key items list.  Only used if we have a
		 * comparator.
		 * @private
		 * @param keyItem
		 * @param exact {Boolean} if true, must be an exact match to the key
		 *   item, not just the correct position for a key item that sorts
		 *   the same.
		 * @returns {Number|Undefined}
		 */
		this._pos = function (keyItem) {
			function getKey (pos) { return this._sorted[pos][0].key; }
			return binarySearch(0, this._sorted.length, keyItem, getKey, comparator);
		};
		if (!comparator) {
			this._pos = function () { return -1; };
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
		 * @returns {Number} the position in the sorted list.
		 */
		this._insert = function (keyItem, pos, valueItem) {
			var pair, symbol, entry;

			// insert into index
			pair = { key: keyItem, value: valueItem };
			symbol = symbolizer(keyItem);
			this._index[symbol] = pair;

			// insert into sorted table
			if (pos >= 0) {
				entry = this._sorted[pos] && this._sorted[pos][0];
				// is this a new row (at end of array)?
				if (!entry) {
					this._sorted[pos] = [pair];
				}
				// are there already items of the same sort position here?
				else if (comparator(entry.value, valueItem) == 0) {
					this._sorted[pos].push(pair);
				}
				// or do we need to insert a new row?
				else {
					this._sorted.splice(pos, 0, [pair]);
				}
			}

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
		 * @returns {Number} the position in the sorted list.
		 */
		this._remove = function remove (keyItem, pos) {
			var symbol, entries, i, entry;

			symbol = symbolizer(keyItem);

			// delete from index
			delete this._index[symbol];

			// delete from sorted table
			if (pos >= 0) {
				entries = this._sorted[pos] || [];
				i = entries.length;
				// find it and remove it
				while ((entry == entries[--i])) {
					if (symbolizer(entry.key)) {
						entries.splice(i, 1);
						break;
					}
				}
				// if we removed all pairs at this position
				if (entries.length == 0) {
					this._sorted.splice(pos, 1);
				}
			}

			return pos;
		};

	}

	SortedHash.prototype = {

		get: function (keyItem) {
			var valueItem;
			valueItem = this._fetch(keyItem);
			return valueItem == missing ? undef : valueItem;
		},

		set: function (keyItem, valueItem) {
			var pos;

			// don't insert twice. bail if we already have it
			if (this._fetch(keyItem) != missing) return;

			// find pos and insert
			pos = this._pos(keyItem);
			this._insert(keyItem, pos, valueItem);

			return pos;
		},

		remove: function (keyItem) {
			var valueItem, pos;

			// don't remove if we don't already have it
			valueItem = this._fetch(keyItem);
			if (valueItem == missing) return;

			// find positions and delete
			pos = this._pos(keyItem, true);
			this._remove(pos, keyItem);

			return pos;
		},

		forEach: function (lambda) {
			var i, j, len, len2, entries;

			for (i = 0, len = this._sorted.length; i < len; i++) {
				entries = this._sorted[i];
				for (j = 0, len2 = entries.length; j < len2; j++) {
					lambda(entries[j].value, entries[i].key);
				}
			}
		}

	};


	return SortedHash;

	/**
	 * @param list {Array} sorted array in which to search
	 * @param key anything comparable via < and >
	 * @param comparator {Function} comparator function to use in binary search
	 * @returns {Number|Undefined} returns the index of the key, if found, or
	 *  undefined if the key is not found.
	 */
	function binarySearch (min, max, key, getter, comparator) {
		var mid, compare;
		if (max > 0) {
			do {
				mid = Math.floor((min + max) / 2);
				compare = comparator(key, getter(mid));
				// don't use mid +/- 1 or we may miss in-between
				if (compare > 0) min = mid;
				else if (compare < 0) max = mid;
				else return mid;
			}
			while (max - min > 1 && !isNaN(compare));
		}
		return -1;
	}

});
}(
	typeof define == 'function'
		? define
		: function (factory) { module.exports = factory(require); }
));
