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

	JsonPatch.prototype = Object.create(Rest.prototype, {
		update: {
			value: updateJsonPatch,
			configurable: true,
			writable: true
		}
	});

	function updateJsonPatch(patch) {
		return patch.length === 0
			? when.resolve()
			: this._client({
				method: 'PATCH',
				entity: patch
			});
	}

	return JsonPatch;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
