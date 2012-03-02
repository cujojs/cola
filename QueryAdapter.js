/** MIT License (c) copyright B Cavalier & J Hann */

(function(define) {
define(function (require) {

//	"use strict";

	var when, map, Notifier, undef;

	when = require('when');
	map = require('./map');
	Notifier = require('./Notifier');

	/**
	 * Manages a collection of objects taken a queryable data source, which
	 * must provide query, add, and remove methods
	 * @constructor
	 * @param datasource {Object} queryable data source with query, add, remove methods
	 * @param [options.symbolizer] {Function} function that returns an identity for
	 * items in the datasource
	 * @param options.comparator {Function} comparator function that will
	 * be propagated to other adapters as needed
	 */
	function QueryAdapter(datasource, options) {

		this._datasource = datasource;
		this._options = options || {};

		this.symbolizer = this._options.symbolizer || function(item) { return datasource.getIdentity(item); }
		this.comparator = this._options.comparator;

		this._notifier = new Notifier();

		this._items = map.createTreeMap(this.comparator);
	}

	QueryAdapter.prototype = {

		comparator: undef,

		symbolizer: undef,

		query: function(query, options) {

			var self = this;

			return this._queue(function() {
				return when(self._datasource.query(query||{}, options),
				function(results) {
					self._items = map.createTreeMap(self.comparator);
					self._initResultSet(results, self._items, self.symbolizer);
					return results;
				});
			});
		},

		_queue: function(op) {
			this._inflight = when(this._inflight, function() {
				return op();
			});

			return this._inflight;
		},

		_initResultSet: function(results, map, symbolizer) {
			var notifier = this._notifier;

			return when.reduce(results, function(unused, item) {
				map.set(symbolizer(item), item);
				return notifier.notify('add', item);
			}, results);
		},

		// just stubs for now
		getOptions: function() {
			return this._options;
		},

		watch: function(itemAdded, itemRemoved) {
			var unlistenAdd, unlistenRemove, notifier;

			notifier = this._notifier;

			unlistenAdd = notifier.listen('add', itemAdded);
			unlistenRemove = notifier.listen('remove', itemRemoved);

			return function() {
				unlistenAdd();
				unlistenRemove();
			}
		},

		forEach: function(lambda) {
			var self = this;
			return this._queue(function() {
				return self._items.forEach(lambda);
			});
		},

		add: function(item) {
			var id, notifier, items, added;

			items = this._items;
			id = this.symbolizer(item);
			added = items.set(id, item);

			if(added) {

				notifier = this._notifier;

				// This is optimistic, maybe overly so.  It notifies listeners
				// that the item is added, even though there may be an inflight
				// async store.add().  If the add fails, it tries to revert
				// by removing the item from the local map, notifying listeners
				// that it is removed, and "rethrowing" the failure.
				return when.all([
					this._datasource.add(item),
					this._notifier.notify('add', item)
				],
					null, // If all goes according to plan, great, nothing to do
					function(err) {
						items.remove(id);

						function propagateError() {
							// Always rethrow here to propagate the failure
							throw err;
						}

						return when(notifier.notify('remove', item), propagateError, propagateError);
					}
				);
			}
		},

		remove: function(item) {
			var id, removed, notifier, items;

			items = this._items;
			id = this.symbolizer(item);
			removed = items.remove(id);

			if(removed !== undef) {
				notifier = this._notifier;

				// Similar to add() above, this may be too optimistic.
				return when.all([
					this._datasource.remove(item),
					this._notifier.notify('remove', item)
				],
					null, // If all goes according to plan, great, nothing to do
					function(err) {
						items.add(id, item);

						function propagateError() {
							// Always rethrow here to propagate the failure
							throw err;
						}

						return when(notifier.notify('add', item), propagateError, propagateError);
					}
				);
			}

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
