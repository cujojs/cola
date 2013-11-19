/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author: Brian Cavalier
 * @author: John Hann
 */
(function(define) { 'use strict';
define(function(require) {

	var ArrayMetadata, ArrayIndex, ObjectMetadata;

	ArrayIndex = require('./metadata/ArrayIndex');
	ArrayMetadata = require('./metadata/ArrayMetadata');
	ObjectMetadata = require('./metadata/ObjectMetadata');

	/**
	 * A LocalStorage datasource
	 * @param {string} namespace namespace to use to store data in localstorage
	 * @param {object?} options
	 * @param {object?} options.localStorage LocalStorage API to use, defaults to
	 *  window.localStorage
	 * @param {function?} options.init function used to initialize localStorage
	 *  namespace when it's found to be non-existent
	 * @param {function?} options.id identifier function for data items
	 * @constructor
	 */
	function LocalStorage(namespace, options) {
		if(!options) {
			options = {};
		}

		this._namespace = namespace;
		this._storage = options.localStorage || window.localStorage;
		this._initStorage = options.init || initWithArray;

		this.metadata = options.metadata || this._createDefaultMetadata(options.id);

		this._index = new ArrayIndex(this.metadata.model.id);
	}

	LocalStorage.prototype = {
		fetch: function(/*options*/) {
			var data = this._storage.getItem(this._namespace);
			data = data == null ? this._initStorage() : JSON.parse(data);

			this._index.rebuild(data);

			return data;
		},

		update: function(changes) {
			var data = this.fetch();

			data = this.metadata.patch(data, changes);

			this._storage.setItem(this._namespace, JSON.stringify(data));
			this._index.rebuild(data);
		},

		_createDefaultMetadata: function(id) {
			var metadata = new ArrayMetadata(new ObjectMetadata(id), getIndex);
			var self = this;

			return metadata;

			function getIndex(change) {
				return change.type === 'updated'
					? self._index.find(change.object[change.name])
					: change.name;
			}
		}
	};

	return LocalStorage;

	function initWithArray() {
		return [];
	}

});
})(typeof define == 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }
);
