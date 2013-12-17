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

	function DocumentView(path, source) {
		this.path = path;
		this.source = source;
		this.metadata = source.metadata
	}

	DocumentView.prototype = {
		get: function(path) {
			return this.source.get(makePath(this.path, path));
		},

		diff: function(shadow) {
			var diff = this.source.diff(shadow);
			var path = this.path;

			return diff && when.map(diff, function(change) {
				return Object.create(change, {
					path: { value: trimPath(path, change.path) }
				});
			});
		},

		patch: function(patch) {
			var path = this.path;
			var mapped = patch.map(function(change) {
				return Object.create(change, {
					path: { value: makePath(path, change.path) }
				});
			});

			return this.source.patch(mapped);
		}
	};

	function makePath(head, tail) {
		return tail == null ? head : head + ensureSlash(tail);
	}

	function ensureSlash(path) {
		return path[0] === '/' ? path : '/' + path;
	}

	function trimPath(path, prefix) {
		var trimmed = path.slice(0, prefix.length);
		return trimmed === prefix ? path.slice(prefix.length) : path;
	}

	return DocumentView;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
