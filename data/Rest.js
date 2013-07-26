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

	function RestStorage(client, metadata) {
		this._client = client;
		this.metadata = metadata;
	}

	RestStorage.prototype = {
		fetch: function(options) {
			return this._client(options);
		},

		update: function(changes) {
			var client, id;

			client = this._client;
			id = this.metadata.model.id;

			return when.reduce(changes, function(_, change) {
				var entity;

				if(change.type === 'new') {
					entity = change.object[change.name];
					return client({
						method: 'POST',
						entity: entity
					});
				}

				if(change.type === 'updated') {
					entity = change.object[change.name];
					return client({
						method: 'PUT',
						path: id(entity),
						entity: entity
					});
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
