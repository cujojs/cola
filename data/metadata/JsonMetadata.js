/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author Brian Cavalier
 * @author John Hann
 */

(function(define) { 'use strict';
define(function(require) {

	var jsonPatch = require('../../lib/jsonPatch');
	var id = require('./id');

	function JsonMetadata(identify) {
		this.id = id(identify);
	}

	JsonMetadata.prototype = {
		diff: function(before, after) {
			return jsonPatch.diff(before, after, this.id);
		},

		patch: function(x, changes) {
			return jsonPatch.patch(changes, x, this.id);
		}
	};

	return JsonMetadata;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
