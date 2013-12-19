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

	var path = require('../lib/path');
	var when = require('when');

	function DocumentView(path, source) {
		this.path = path;
		this.source = source;
		this.metadata = source.metadata
	}

	DocumentView.prototype = {
		get: function(p) {
			return this.source.get(path.join(this.path, p));
		},

		diff: function(shadow) {
			var diff = this.source.diff(shadow);
			var p = this.path;

			return diff && when.map(diff, function(change) {
				return Object.create(change, {
					path: { value: path.trim(p, change.path) }
				});
			});
		},

		patch: function(patch) {
			var p = this.path;
			var mapped = patch.map(function(change) {
				return Object.create(change, {
					path: { value: path.join(p, change.path) }
				});
			});

			return this.source.patch(mapped);
		}
	};

	return DocumentView;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
