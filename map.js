/** MIT License (c) copyright B Cavalier & J Hann */

(function (define) {
define(function () {

	/**
	 * A simple hash map that uses a symbolizer to derive a usable key and
	 * stores its items in a simple Javascript object
	 * @param symbolizer {Function} function(anything) must return a key usable as
	 * a Javascript object property key
	 */
	function HashMap(symbolizer) {
		this._symbolizer = symbolizer;
		this._index = {};
		this._items = [];
	}

	HashMap.prototype = {
		get: function(key) {
			return this._items[this._index[this._symbolizer(key)]];
		},

		set: function(key, item) {
			this._index[this._symbolizer(key)] = this._items.push(item) - 1;
			return item;
		},

		remove: function(key) {
			key = this._symbolizer(key);
			delete this._items[this._index[key]];
			delete this._index[key];
		},

		forEach: function(lambda) {
			for(var k in this._index) lambda(this._items[this._index[k]], k);
		}
	};

	/**
	 * A map that uses a binary tree to store its items
	 * @param comparator {Function} function(a, b) returns -1 when a < b,
	 * 1 when a > b, and 0 when a == b
	 */
	function TreeMap(comparator) {
		var items = this._items = [];

		this._find = comparator
			? function(key) {
				binarySearch(items, key, comparator);
			}
			: function(key) {
				linearScan(items, key);
			};
	}

	TreeMap.prototype = {
		get: function(key) {
			var entry = this._items[this._find(key)];
			return entry && entry.item;
		},

		set: function(key, item) {
			this._items.splice(this._find(key) || this._items.length, 0, { key: key, item: item });
		},

		remove: function(key) {
			this._items.splice(this._find(key) || this._items.length, 1);
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
			return options.symbolizer
				? new HashMap(options.symbolizer)
				: new TreeMap(options.comparator);
		},
		createHashMap: function(symbolizer) {
			return new HashMap(symbolizer);
		},
		createTreeMap: function(comparator) {
			return new TreeMap(comparator);
		}
	};

	function binarySearch(list, key, comparator) {
		var min, max, mid, compare;
		min = 0;
		max = list.length;
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
