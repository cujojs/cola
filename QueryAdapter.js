/** MIT License (c) copyright B Cavalier & J Hann */

(function(define) {
define(function (require) {

//	"use strict";

	var when, SortedMap, Notifier, undef;

	when = require('when');
	SortedMap = require('./SortedMap');
	Notifier = require('./Notifier');

	/**
	 * Manages a collection of objects taken a queryable data source, which
	 * must provide query, add, and remove methods
	 * @constructor
	 * @param datasource {Object} queryable data source with query, add, remove methods
	 * @param [options.comparator] {Function} comparator function that will
	 * be propagated to other adapters as needed.  Note that QueryAdapter does not
	 * use this comparator internally.
	 */
	function QueryAdapter(datasource, options) {

		var identifier;

		this._datasource = datasource;
		this._options = options || {};

		// Always use the datasource's identity as the identifier
		identifier = this.identifier =
			function(item) {
				return datasource.getIdentity(item);
			};

		// If no comparator provided, generate one that uses
		// the object identity
		this.comparator = this._options.comparator ||
			function(a, b) {
				var aKey, bKey;

				aKey = identifier(a);
				bKey = identifier(b);

				return aKey == bKey ? 0
					: aKey < bKey ? -1
					: 1;
			};

		this._items = new SortedMap(identifier, this.comparator);
	}

	QueryAdapter.prototype = {

		comparator: undef,

		identifier: undef,

		query: function(query, options) {

			var self = this;

			return this._queue(function() {
				return when(self._datasource.query(query||{}, options),
				function(results) {
					self._items = new SortedMap(self.identifier, self.comparator);
					self._initResultSet(results);
					return results;
				});
			});
		},

		/**
		 * Adds op to the internal queue of async tasks to ensure that
		 * it will run in the order added and not overlap with other async tasks
		 * @param op {Function} async task (function that returns a promise) to add
		 *  to the internal queue
		 * @return {Promise} promise that will resolver/reject when op has completed
		 * @private
		 */
		_queue: function(op) {
			this._inflight = when(this._inflight, function() {
				return op();
			});

			return this._inflight;
		},

		/**
		 * Initialized the internal map of items
		 * @param results {Array} array of result items
		 * @private
		 */
		_initResultSet: function (results) {
			var map, i, len, item, self;

			map = this._items;
			map.clear();

			self = this;
			for(i = 0, len = results.length; i < len; i++) {
				item = results[i];
				map.add(item, item);
				self.add(item);
			}
		},

		getOptions: function() {
			return this._options;
		},

		forEach: function(lambda) {
			var self = this;
			return this._queue(function() {
				return self._items.forEach(lambda);
			});
		},

		add: function(item) {
			var items, added;

			items = this._items;
			added = items.add(item, item);

			if(added >= 0) {

				// This is optimistic, maybe overly so.  It notifies listeners
				// that the item is added, even though there may be an inflight
				// async store.add().  If the add fails, it tries to revert
				// by removing the item from the local map, notifying listeners
				// that it is removed, and "rethrowing" the failure.
				return when(this._datasource.add(item),
					null, // If all goes according to plan, great, nothing to do
					function(err) {
						items.remove(item);
						throw err;
					}
				);
			}
		},

		remove: function(item) {
			var removed, items;

			items = this._items;
			removed = items.remove(item);

			if(removed >= 0) {

				// Similar to add() above, this may be too optimistic.
				return when(this._datasource.remove(item),
					null, // If all goes according to plan, great, nothing to do
					function(err) {
						items.add(item, item);
						throw err;
					}
				);
			}
		},

		update: function(item) {
			var orig, items, self;

			items = this._items;
			orig = items.get(item);

			if(orig) {
				this._replace(orig, item);

				self = this;

				// Similar to add() above, this may be too optimistic.
				return when(this._datasource.put(item),
					null, // If all goes according to plan, great, nothing to do
					function(err) {
						self._replace(item, orig);

						items.remove(item);
						items.add(orig, orig);
						throw err;
					}
				)
			}
		},

		_replace: function(oldItem, newItem) {
			this._items.remove(oldItem);
			this._items.add(newItem, newItem);
		},

		clear: function() {
			this._initResultSet([]);
		}
	};

	QueryAdapter.canHandle = function(it) {
		return it && typeof it.query == 'function' && !(it instanceof QueryAdapter);
	};

	return QueryAdapter;
});

})(
	typeof define == 'function'
		? define
		: function(factory) { module.exports = factory(require); }
);
