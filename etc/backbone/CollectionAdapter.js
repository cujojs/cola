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

	var when, metadata, diffCollection;

	when = require('when');
	metadata = require('./metadata');
	diffCollection = require('./diffCollection');

	function CollectionAdapter(collection) {
		this._collection = collection;
		this.metadata = Object.create(metadata, {
			diff: { value: diffCollection },
			patch: { value: patchCollection }
		});
	}

	CollectionAdapter.prototype = {
		fetch: function(options) {
			var collection = this._collection;
			return when.resolve(collection.fetch(options))
				.yield(collection);
		},

		update: function() {}
	};

	return CollectionAdapter;

	function patchCollection(collection, changes) {
		return changes.reduce(function(collection, change) {

			if(change.type === 'new') {
				collection.add(change.object[change.name]);
			} else if(change.type === 'updated') {
				collection.add(change.object[change.name], { merge: true });
			} else if(change.type === 'deleted') {
				collection.remove(change.name);
			}

		}, collection);
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
