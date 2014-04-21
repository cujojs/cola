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

	var rest = require('rest');
	var entity = require('rest/interceptor/entity');
	var mime = require('rest/interceptor/mime');
	var pathPrefix = require('rest/interceptor/pathPrefix');
	var location = require('rest/interceptor/location');

	var JsonMetadata = require('./metadata/JsonMetadata');

	/**
	 * A rest.js (cujoJS/rest) based datasource.
	 * @constructor
	 */
	function Rest(client, options) {
		if(!options) {
			options = {};
		}

		this._client = typeof client === 'function'
			? client
			: this._createDefaultClient(client);

		this.metadata = options.metadata || new JsonMetadata(options.id);
	}

	Rest.prototype = {
		get: function(path) {
			this._shadow = this._client(path);
			return this._shadow.then(this.metadata.clone);
		},

		diff: function(shadow) {
			var metadata = this.metadata;
			return when(this._shadow, function(data) {
				return metadata.diff(shadow, data);
			});
		},

		patch: function(patch) {

			var metadata = this.metadata;
			var identify = this.metadata.id;
			var client = this._client;
			var seen = {};
			var self = this;

			return when(this._shadow, send);

			function send(data) {
				self._shadow = data = self.metadata.patch(data, patch);

				// Because adds and deletes affect array indices, ideally
				// a patch for an array should be processed in descending index
				// order, but for now just assume it was generated in ascending
				// index order and reverse it.  Need a better strategy here for
				// arrays.  Using ids would work out fine regardless.
				return when.reduce(patch.reverse(), function(_, change) {
					/*jshint maxcomplexity:7*/
					var entity, segments;
					var p = change.path;

					segments = p.split(change.path);
					p = segments[0];

					if(seen[p]) {
						return;
					}

					seen[p] = 1;

					if(segments.length === 1) {
						if(change.op === 'add') {
							entity = metadata.getValue(data, p);
							return entity !== void 0 && client({
								method: 'POST',
								entity: entity
							});
						} else if(change.op === 'replace') {
							entity = metadata.getValue(data, p);
							return entity !== void 0 && client({
								method: 'PUT',
								path: identify(entity) || p,
								entity: entity
							});
						} else if(change.op === 'remove') {
							return client({
								method: 'DELETE',
								path: p
							});
						}
					} else if(segments.length > 1) {
						entity = metadata.getValue(data, p);
						return entity !== void 0 && client({
							method: 'PUT',
							path: identify(entity) || p,
							entity: entity
						});
					}
				}, void 0);
			}
		},

		_createDefaultClient: function(baseUrl, mimeType) {
			var client = typeof baseUrl === 'string'
				? rest.chain(pathPrefix, { prefix: baseUrl }) : rest;

			return client
				.chain(mime, { mime: mimeType || 'application/json' })
				.chain(location)
				.chain(entity);
		}
	};

	return Rest;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
