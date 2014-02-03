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
		this._shadow = jsonPatch.snapshot(data);
		this.metadata = new JsonMetadata(identify);
	}

	MemoryStorage.prototype = {
		get: function(path) {
			return jsonPointer.getValue(this._shadow, path, this._shadow);
		},

		diff: function(shadow) {
			return this.metadata.diff(shadow, this._shadow);
		},

		patch: function(patch) {
			this._shadow = this.metadata.patch(this._shadow, patch);
		}
	};

	return MemoryStorage;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
