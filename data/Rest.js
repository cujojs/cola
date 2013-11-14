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

	var when, rest, pathPrefix, entity, mime, location,
		ArrayIndex, ArrayMetadata, ObjectMetadata, entityUpdaters;

	when = require('when');

	rest = require('rest');
	pathPrefix = require('rest/interceptor/pathPrefix');
	entity = require('rest/interceptor/entity');
	mime = require('rest/interceptor/mime');
	location = require('rest/interceptor/location');

	ArrayIndex = require('cola/data/metadata/ArrayIndex');
	ArrayMetadata = require('cola/data/metadata/ArrayMetadata');
	ObjectMetadata = require('cola/data/metadata/ObjectMetadata');

	function defaultClient() {
		return rest
			.chain(mime, { mime: 'application/json' })
			.chain(location)
			.chain(entity);
	}

	/**
	 * A rest.js (cujoJS/rest) based datasource.
	 * @param {function} client configured rest client to use to fetch and
	 *  store data.
	 * @param {{
	 *  client: function
	 *  patch: boolean,
	 *  metadata: {
	 *   model: {id: function, get:function, set:function}
	 *   diff: function
	 *   patch: function
	 *  }
	 * }} options
	 * @constructor
	 */
	function Rest(path, options) {
		if(!options) {
			options = {};
		}

		var client = options.client || defaultClient();
		this._client = client.chain(pathPrefix, { prefix: path });

//		this.metadata = options.metadata || defaultMetadata();
		this.metadata = new ArrayMetadata(
			new ObjectMetadata(options && options.id), getIndex);
		this._index = new ArrayIndex(this.metadata.model.id);

		var index = this._index;
		function getIndex(change) {
			return change.type === 'updated'
				? index.find(change.object[change.name])
				: change.name;
		}

		this._options = options;

		this._strategy = options.jsonPatch
			? jsonPatchRestStrategy
			: simpleRestStrategy;

	}

	Rest.prototype = {
		fetch: function(options) {
			var self = this;
			return this._client(options).tap(function(data) {
				self._index.init(data);
				return data;
			});
		},

		update: function(changes) {
			return this._strategy(this._client, this.metadata.model.id, this._options, changes);
		}
	};

	function simpleRestStrategy(client, id, options, changes) {
		var enablePatch = options.patch;

		return when.reduce(changes, function (_, change) {
			var entity, entityId, updateMethod;

			if (change.type === 'new') {
				entity = change.object[change.name];
				return client({
					method: 'POST',
					entity: entity
				});
			}

			if (change.type === 'updated') {
				entity = change.object[change.name];
				entityId = id(entity);
				updateMethod = enablePatch && 'changes' in change
					? 'patch'
					: 'put';

				return client(entityUpdaters[updateMethod](change, entity, entityId));
			}

			if (change.type === 'deleted') {
				entity = change.oldValue;
				return client({
					method: 'DELETE',
					path: id(entity)
				});
			}
		}, void 0);
	}

	entityUpdaters = {
		put: function(change, entity, id) {
			return {
				method: 'PUT',
				path: id,
				entity: entity
			};
		},

		patch: function(change, entity, id) {
			var patch = change.changes.reduce(function(patch, change) {
				patch[change.name] = entity[change.name];
				return patch;
			}, {});

			return {
				method: 'PATCH',
				path: id,
				entity: patch
			}
		}
	};

	function jsonPatchRestStrategy(client, id, options, changes) {
		var patch = changes.reduce(function (patch, change) {
			var entity;

			entity = change.object[change.name];

			if (change.type === 'new') {
				patch.push({
					op: 'add',
					path: id(entity),
					value: entity
				});
			} else if (change.type === 'updated') {
				patch.push({
					op: 'replace',
					path: id(entity),
					value: entity
				});
			} else if (change.type === 'deleted') {
				patch.push({
					op: 'remove',
					path: id(change.oldValue)
				});
			}

			return patch;
		}, []);

		return client({
			method: 'PATCH',
			entity: patch
		});
	}

	return Rest;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
