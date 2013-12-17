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
	var Rest = require('./Rest');

	function JsonPatch(client, options) {
		Rest.apply(this, arguments);
	}

	JsonPatch.prototype = Object.create(Rest.prototype);

	JsonPatch.prototype.patch = function(patch) {
		var metadata = this.metadata;
		var self = this;
		this._data = when(this._data, function(data) {
			self._client({
				method: 'PATCH',
				entity: patch
			}).then(function(remotePatch) {
				return metadata.patch(metadata.patch(data, patch), remotePatch);
			})
		});

		return this._data.yield();
	};

	return JsonPatch;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
