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

	var jiff = require('jiff');
	var jsonPointer = require('jiff/lib/jsonPointer');

	function JsonMetadata(identify) {
		this.id = identify;
	}

	JsonMetadata.prototype = {
		clone: function(data) {
			return jiff.clone(data);
		},

		diff: function(before, after) {
			return jiff.diff(before, after, this.id);
		},

		patch: function(x, changes) {
			return jiff.patch(changes, x, this.id);
		},

		getValue: function(data, path, defaultValue) {
			return jsonPointer.getValue(data, path, defaultValue);
		}
	};

	return JsonMetadata;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
