/** MIT License (c) copyright B Cavalier & J Hann */

(function(define) {
define(['./WatchableCollection'], function(makeWatchable) {

	function CollectionAdapter(collection) {

		this._watchable = makeWatchable(collection);

	}

	CollectionAdapter.prototype = {

		watch: function(itemAdded, itemUpdated, itemRemoved) {
			return this._watchable.watch(itemAdded, itemUpdated, itemRemoved);
		},

		itemAdded: function(item) {
			return this._watchable.add(item);
		},

		itemUpdated: function(item) {
			return this._watchable.update(item);
		},

		itemRemoved: function(item) {
			return this._watchable.remove(item);
		}
	};

	CollectionAdapter.canHandle = function(it) {
		return it
			&& typeof it.add == 'function'
			&& typeof it.remove == 'function'
			&& typeof it.update == 'function'
	};

	return CollectionAdapter;

});
})(
	typeof define == 'function'
		? define
		: function(deps, factory) { module.exports = factory.apply(this, deps.map(require)); }
);
