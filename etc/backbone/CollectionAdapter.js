/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author: Brian Cavalier
 * @author: John Hann
 */
(function(define) {
define(function(require) {

	var when, Metadata, iterator;

	when = require('when');
	Metadata = require('./Metadata');
	iterator = require('../../lib/iterator');

	function CollectionAdapter(collection) {
		this._collection = Object.create(collection, {
			iterator: { value: function() {
				return iterator(collection.models.slice());
			}}
		});

		this.metadata = new Metadata(this._collection);
	}

	CollectionAdapter.prototype = {
		fetch: function(options) {
			var collection = this._collection;
			return when.resolve(collection.fetch(options))
				.yield(collection);
		},

		update: function(changes) {
			return when.reduce(changes, function(_, change) {

				if(change.type === 'new' || change.type === 'updated') {
					var model = change.object[change.name];
					if(model.changedAttributes()) {
						return model.save();
					}
				}

			}, void 0);
		}
	};

	return CollectionAdapter;


});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
