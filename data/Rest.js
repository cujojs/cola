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
		JsonMetadata, jsonPointer;

	when = require('when');

	rest = require('rest');
	entity = require('rest/interceptor/entity');
	mime = require('rest/interceptor/mime');
	pathPrefix = require('rest/interceptor/pathPrefix');
	location = require('rest/interceptor/location');

	jsonPointer = require('../lib/jsonPointer');
	JsonMetadata = require('./metadata/JsonMetadata');

	/**
	 * A rest.js (cujoJS/rest) based datasource.
	 * @constructor
	 */
	function Rest(client, options) {
		if(!options) {
			options = {};
		}

		this._client = typeof client === 'function' ? client : defaultClient(client);

		this._options = options;
		this.metadata = options.metadata || new JsonMetadata(options.id);
	}

	Rest.prototype = {
		get: function(path) {
			return this._shadow = this._client(path);
		},

		update: function(changes) {

			var identify = this.metadata.id;
			var client = this._client;
			var seen = {};

			return when(this._shadow, send);

			function send(shadow) {
				return when.map(changes, function(change) {
					var entity, segments;
					var path = change.path;

					if(path[0] === '/') {
						path = path.slice(1);
					}

					segments = path.split('/');
					path = segments[0];

					if(seen[path]) {
						return;
					}

					seen[path] = 1;

					if(segments.length === 1) {
						if(change.op === 'add') {
							entity = jsonPointer.getValue(shadow, path);
							return entity !== void 0 && client({
								method: 'POST',
								entity: entity
							});
						} else if(change.op === 'replace') {
							entity = jsonPointer.getValue(shadow, path);
							return entity !== void 0 && client({
								method: 'PUT',
								path: identify(entity),
								entity: entity
							});
						} else if(change.op === 'remove') {
							return client({
								method: 'DELETE',
								path: identify(entity)
							});
						}
					} else if(segments.length > 1) {
						entity = jsonPointer.getValue(shadow, path);
						return entity !== void 0 && client({
							method: 'PUT',
							path: identify(entity),
							entity: entity
						});
					}
				});
			}
		}
	};

	function defaultClient(baseUrl) {
		var client = typeof baseUrl === 'string'
			? rest.chain(pathPrefix, { prefix: baseUrl }) : rest;

		return client
			.chain(mime, { mime: 'application/json' })
			.chain(location)
			.chain(entity);
	}

	return Rest;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
