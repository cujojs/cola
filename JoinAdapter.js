/** MIT License (c) copyright B Cavalier & J Hann */


// TODO:
// 1. Incrementally recompute the join for items added to or removed from the
//    primary adapter.  This requires precomputing and hanging onto the joinMap
// 2. Recompute the join when items are added to or removed from the supplimental

(function(define) {
define(function (require) {

"use strict";

	var when = require('when');

	function JoinAdapter(primary, options) {

		if(!(options && options.joinWith && options.strategy)) {
			throw new Error('options.joinWith and options.strategy are required');
		}

		this.identifier = primary.identifier;
		this.comparator = primary.comparator;

		this._primary = primary;
		this._options = options;
		this._joinStrategy = options.strategy;
	}

	JoinAdapter.prototype = {

		getOptions: function() {
			return this._primary.getOptions();
		},

		watch: function(added, removed) {
			return this._primary.watch(added, removed);
		},

		forEach: function(lambda) {
			var joined = this._joined;
			if(!joined) {
				joined = this._joined = this._doJoin();
			}

			return when(joined, function(joined) {
				for(var i = 0, len = joined.length; i < len; i++) {
					lambda(joined[i]);
				}
			});
		},

		add: function(item) {
			// Force the join to be recomputed
			// It is possible to incrementally compute the join only for
			// the new item, but for now, punt.
			var self = this;
			return when(this._primary.add(item), function(added) {
				if(added) {
					self._joined = null;
				}

				return added;
			});
		},

		remove: function(item) {
			// Similarly, force join recompute .. optimize with incremental later
			var self = this;
			return when(this._primary.remove(item), function(removed) {
				if(removed) {
					self._joined = null;
				}

				return removed;
			});
		},

		_doJoin: function() {
			var left, right;

			left = this._primary;
			right = this._options.joinWith;

			return this._joinStrategy(left, right);
		}
	};

	return JoinAdapter;

});
})(
	typeof define == 'function'
		? define
		: function(factory) { module.exports = factory(require); }
);
