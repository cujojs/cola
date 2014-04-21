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

	var JsonMetadata = require('./metadata/JsonMetadata');

	function MemoryStorage(data, identify) {
		this.metadata = new JsonMetadata(identify);
		this._shadow = this.metadata.clone(data);
	}

	MemoryStorage.prototype = {
		get: function(path) {
			return this.metadata.getValue(this._shadow, path, this._shadow);
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
