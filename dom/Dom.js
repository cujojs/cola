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

	var domPatch = require('./domPatch');

	function Dom(node) {
		this.node = node;
	}

	Dom.prototype = {
		set: function(data, path) {
			return domPatch.set(this.fetch(path), data);
		},

		fetch: function(path) {
			return domPatch.find(path, this.node);
		},

		update: function(patch) {
			domPatch.patch(this.node, patch);
		}
	};

	return Dom;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
