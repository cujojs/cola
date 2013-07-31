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

	var when = require('when');

	var entityUpdaters = {
		put: function(change, entity, id) {
			return {
				method: 'PUT',
				path: id,
				entity: entity
			};
		},

		patch: function(change, entity, id) {
			var entity, patch;

			entity = change.object[change.name];

			patch = change.changes.reduce(function(patch, change) {
				patch[change.name] = entity[change.name];
				return patch;
			}, {});

			return {
				method: 'PATCH',
				path: id,
				entity: patch
			}
		}
	}

	/**
	 * A rest.js (cujoJS/rest) based datasource.
	 * @param {function} client configured rest client to use to fetch and
	 *  store data.
	 * @param {{
	 *  model: {id: function, get:function, set:function}
	 *  diff: function
	 *  patch: function
	 * }} metadata metadata description of data. metadata.model must provide
	 *  id, get, and set functions to get the identity of data items,
	 *  and to get/set properties, and diff/patch functions to compute
	 *  changes in data items and patch (update) them using a set of changes
	 * @param {{ patch: boolean }} options
	 * @constructor
	 */
	function RestStorage(client, metadata, options) {
		this._client = client;
		this.metadata = metadata;
		this._options = options || {};
	}

	RestStorage.prototype = {
		fetch: function(options) {
			return this._client(options);
		},

		update: function(changes) {
			var client, id, updateMethod;

			client = this._client;
			id = this.metadata.model.id;
			updateMethod = this._options.updateMethod || 'put';
			updateMethod = updateMethod.toLowerCase();

			return when.reduce(changes, function(_, change) {
				var entity, entityId;

				if(change.type === 'new') {
					entity = change.object[change.name];
					return client({
						method: 'POST',
						entity: entity
					});
				}

				if(change.type === 'updated') {
					entity = change.object[change.name];
					entityId = id(entity);

					return client(entityUpdaters[updateMethod](change, entity, entityId));
				}

				if(change.type === 'deleted') {
					entity = change.oldValue;
					return client({
						method: 'DELETE',
						path: id(entity)
					});
				}
			}, void 0);
		}
	};

	return RestStorage;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
