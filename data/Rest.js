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

	var when, rest, entity, mime, pathPrefix, location,
		ArrayMetadata, ObjectMetadata, entityUpdateStrategy;

	when = require('when');

	rest = require('rest');
	entity = require('rest/interceptor/entity');
	mime = require('rest/interceptor/mime');
	pathPrefix = require('rest/interceptor/pathPrefix');
	location = require('rest/interceptor/location');

	ArrayMetadata = require('cola/data/metadata/ArrayMetadata');
	ObjectMetadata = require('cola/data/metadata/ObjectMetadata');

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
	function Rest(client, options) {
		if(!options) {
			options = {};
		}

		this._client = typeof client === 'function' ? client : defaultClient(client);

		this._options = options;
		this.metadata = options.metadata
			|| new ArrayMetadata(new ObjectMetadata(options && options.id));
	}

	Rest.prototype = {
		fetch: function(dataset) {
			return this._client(dataset.path);
		},

		update: function(changes, dataset) {
			var client = this._client;
			var id = dataset.metadata.model.id;
			var getPath = getEntityPath(dataset, id);
			var enablePatch = this._options.patch;

			return when.reduce(changes, function (_, change) {
				var entity, updateMethod;

				if (change.type === 'new') {
					entity = change.object[change.name];
					return client({
						path: dataset.path,
						method: 'POST',
						entity: entity
					});
				}

				if (change.type === 'updated') {
					entity = change.object[change.name];
					updateMethod = enablePatch && 'changes' in change ? 'patch' : 'put';

					return client(entityUpdateStrategy[updateMethod](getPath(entity), entity, change));
				}

				if (change.type === 'deleted') {
					return client({
						method: 'DELETE',
						path: getPath(change.oldValue)
					});
				}
			}, void 0);
		}
	};

	entityUpdateStrategy = {
		put: function(entityPath, entity) {
			return {
				method: 'PUT',
				path: entityPath,
				entity: entity
			};
		},

		patch: function(entityPath, entity, change) {
			var patch = change.changes.reduce(function(patch, change) {
				patch[change.name] = entity[change.name];
				return patch;
			}, {});

			return {
				method: 'PATCH',
				path: entityPath,
				entity: patch
			}
		}
	};

	function getEntityPath(dataset, id) {
		return function(entity) {
			return dataset.path + '/' + id(entity);
		};
	}

	function defaultClient(baseUrl) {
		var client = typeof baseUrl === 'string' ? rest.chain(pathPrefix, { prefix: baseUrl }) : rest;

		return client
			.chain(mime, { mime: 'application/json' })
			.chain(location)
			.chain(entity);
	}

	return Rest;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
