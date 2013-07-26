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

	var ArrayMetadata, ObjectMetadata;

	ArrayMetadata = require('./metadata/ArrayMetadata');
	ObjectMetadata = require('./metadata/ObjectMetadata');

	function ArrayStorage(array, options) {
		this._array = array || [];
		this.metadata = new ArrayMetadata(
			new ObjectMetadata(options && options.id));
	}

	ArrayStorage.prototype = {
		fetch: function(/*options*/) {
			return this._array.slice();
		},

		update: function(changes) {
			this._array = this.patch(this._array, changes);
		}
	};

	return ArrayStorage;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
