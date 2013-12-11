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

	var jsonPointer, jsonPatch, JsonMetadata;

	jsonPointer = require('../lib/jsonPointer');
	jsonPatch = require('../lib/jsonPatch');
	JsonMetadata = require('./metadata/JsonMetadata');

	function MemoryStorage(data, identify) {
		this._data = data;
		this.metadata = new JsonMetadata(identify);
	}

	MemoryStorage.prototype = {
		fetch: function(path) {
			return jsonPointer.getValue(this._data, path);
		},

		update: function(patch) {
			this._data = this.metadata.patch(this._data, patch);
		}
	};

	return MemoryStorage;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
