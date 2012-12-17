/** MIT License (c) copyright B Cavalier & J Hann */

// TODO: Evaluate whether ArrayAdapter should use SortedMap internally to
// store items in sorted order based on its comparator

(function(define) {
define(function (require) {

	"use strict";

	var Base, ArrayAdapter, when, arrayAdapterPrototype, methods, undef;
	Base = require('./Base');
	when = require('when');

	methods = {

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

			key = this.identifier(item);
			index = this._index;

			if(key in index) return null;

			item = index[key] = this._data.push(item) - 1;

			this.onAdd(item);

			return item;
		},

		remove: function(itemOrId) {
			var key, at, index, data, item;

			key = this.identifier(itemOrId);
			index = this._index;

			if(!(key in index)) return null;

			data = this._data;

			at = index[key];
			item = data[at];
			data.splice(at, 1);

			// Rebuild index
			this._index = buildIndex(data, this.identifier);

			if(item) this.onRemove(item);

			return at;
		},

		update: function (item) {
			var key, at, index;

			key = this.identifier(item);
			index = this._index;

			at = index[key];

			if (at >= 0) {
				this._data[at] = item;
				this.onUpdate(item);
			}
//			else {
//				index[key] = this._data.push(item) - 1;
//			}
//
//			this.onUpdate(item);

			return at;
		},

		clear: function() {
			this._data = [];
			this._index = {};

			this.onClear();
		}
	};

	/**
	 * Manages a collection of objects taken from the supplied dataArray
	 * @param dataArray {ArrayAdapter} array of data objects to use as the initial
	 * population
	 * @param options.identifier {Function} function that returns a key/id for
	 * a data item.
	 * @param options.comparator {Function} comparator function that will
	 * be propagated to other adapters as needed
	 */
	arrayAdapterPrototype = {
		provide: true,

		_init: function(dataArray) {
			if(dataArray && dataArray.length) {
				addAll(this, dataArray);
			}
		},

		/**
		 * Default comparator that uses an item's position in the array
		 * to order the items.  This is important when an input array is already
		 * in sorted order, so the user doesn't have to specify a comparator,
		 * and so the order can be propagated to other adapters.
		 * @param a
		 * @param b
		 * @return {Number} -1 if a is before b in the input array
		 *  1 if a is after b in the input array
		 *  0 iff a and b have the same symbol as returned by the configured identifier
		 */
		_defaultComparator: function(a, b) {
			var aIndex, bIndex;

			aIndex = this._index(this.identifier(a));
			bIndex = this._index(this.identifier(b));

			return aIndex - bIndex;
		},

		comparator: undef,

		identifier: undef,

		// just stubs for now
		getOptions: function () {
			return this._options;
		}

	};

	for(var p in methods) {
		arrayAdapterPrototype[p] = promiseAware(methods[p]);
	}

	ArrayAdapter = Base.extend(function ArrayAdapter(dataArray, options) {

		if (!options) options = {};

		this._options = options;

		// Use the default comparator if none provided.
		// The consequences of this are that the default comparator will
		// be propagated to downstream adapters *instead of* an upstream
		// adapter's comparator
		this.comparator = options.comparator || this._defaultComparator;

		this.identifier = options.identifier || defaultIdentifier;

		if ('provide' in options) {
			this.provide = options.provide;
		}

		this._array = dataArray;
		this.clear();

		var self = this;
		when(dataArray, function (array) {
			for (var p in methods) {
				self[p] = methods[p];
			}

			self._init(array);
		});
	}, arrayAdapterPrototype);

	ArrayAdapter.canHandle = function(it) {
		return it && (when.isPromise(it) || Object.prototype.toString.call(it) == '[object Array]');
	};

	return ArrayAdapter;

	function promiseAware(func) {
		return function() {
			var self, args;

			self = this;
			args = Array.prototype.slice.call(arguments);

			return when(this._array, function() {
				return func.apply(self, args);
			});
		};
	}

	function defaultIdentifier(item) {
		return typeof item == 'object' ? item.id : item;
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

});

})(
	typeof define == 'function'
		? define
		: function(factory) { module.exports = factory(require); }
);
