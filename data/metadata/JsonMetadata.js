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
	var ObjectMetadata = require('./ObjectMetadata');

	function JsonMetadata(identify) {
		this.id = identify;
		// TODO: Remove. temporary, to appease BindableView
		this.model = new ObjectMetadata(identify).model;
	}

	JsonMetadata.prototype = {
		diff: function(before) {
			var snapshot = jsonPatch.snapshot(before);
			var identify = this.id;

			return function(after) {
				return jsonPatch.diff(snapshot, after, identify);
			};
		},

		patch: function(x, changes) {
			return jsonPatch.patch(changes, x, this.id);
		}
	};

	return JsonMetadata;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
