/** MIT License (c) copyright B Cavalier & J Hann */

(function (define) {
define(function () {

	var undef;

	/**
	 * A simple hash map that uses a identifier to derive a usable key and
	 * stores its items in a simple Javascript object
	 * @param identifier {Function} function(anything) must return a key usable as
	 * a Javascript object property key
	 */
	function HashMap(identifier) {
		this._identifier = identifier;
		this._index = {};
		this._items = [];
	}

	HashMap.prototype = {
		get: function(key) {
			return this._items[this._index[this._identifier(key)]];
		},

		set: function(key, item) {
			var exists = this._index[this._identifier(key)];

			if(exists) return;

			this._index[this._identifier(key)] = this._items.push(item) - 1;
			return item;
		},

		remove: function(key) {
			var removed;

			key = this._identifier(key);
			removed = this._items[this._index[key]];

			delete this._items[this._index[key]];
			delete this._index[key];

			return removed;
		},

		forEach: function(lambda) {
			for(var k in this._index) lambda(this._items[this._index[k]], k);
		}
	};

	/**
	 * A map that uses a binary tree to store its items if a comparator is
	 * provided, and a simple array with a linear scan if a comparator is
	 * NOT provided.
	 * @param [comparator] {Function} function(a, b) returns -1 when a < b,
	 * 1 when a > b, and 0 when a == b
	 */
	function TreeMap(comparator) {
		var items = this._items = [];

		this._find = comparator
			? function(key) {
				return binarySearch(items, key, comparator);
			}
			: function(key) {
				return linearScan(items, key);
			};
	}

	TreeMap.prototype = {
		get: function(key) {
			var entry = this._items[this._find(key)];
			return entry && entry.item;
		},

		set: function(key, item) {
			var index = this._find(key);

			this._items.splice(index || this._items.length, 0, { key: key, item: item });

			return index === undef;
		},

		remove: function(key) {
			var index, item;

			index = this._find(key);

			if(index === undef) return undef;

			item = this._items[index];
			this._items.splice(index || this._items.length, 1);

			return item;
		},

		forEach: function(lambda) {
			var i, items, entry;
			items = this._items;
			i = items.length;
			while(entry = items[--i]) lambda(entry.item, entry.key);
		}
	};

	return {
		create: function(options) {
			return options.identifier
				? new HashMap(options.identifier)
				: new TreeMap(options.comparator);
		},
		createHashMap: function(identifier) {
			return new HashMap(identifier);
		},
		createTreeMap: function(comparator) {
			return new TreeMap(comparator);
		}
	};

	/**
	 * @param list {Array} sorted array in which to search
	 * @param key anything comparable via < and >
	 * @param comparator {Function} comparator function to use in binary search
	 * @returns {Number|undefined} returns the index of the key, if found, or
	 *  undefined if the key is not found.
	 */
	function binarySearch(list, key, comparator) {
		var min, max, mid, compare;
		min = 0;
		max = list.length;
		if (max == 0) return undef;
		do {
			mid = Math.floor((min + max) / 2);
			compare = comparator(key, list[mid].key);
			// don't use mid +/- 1 or we may miss in-between
			if (compare > 0) min = mid;
			else if (compare < 0) max = mid;
			else return mid;
		}
		while (max - min > 1 && !isNaN(compare));

	}

	/**
	 * @param list {Array} array in which to search
	 * @param key anything comparable via ==
	 * @returns {Number|undefined} returns the index of the key, if found, or
	 *  undefined if the key is not found.
	 */
	function linearScan(list, key) {
		var i, entry;
		i = list.length;
		while ((entry = list[--i])) if (entry.key == key) return i;
	}

});
}(
	typeof define == 'function'
		? define
		: function (factory) { module.exports = factory(require); }
));
