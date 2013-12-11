/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author: Brian Cavalier
 * @author: John Hann
 */

(function(define) { 'use strict';
define(function() {

	function DocumentView(path, datasource) {
		this.path = path;
		this.datasource = datasource;
		this.metadata = datasource.metadata
	}

	DocumentView.prototype = {
		set: function(data, path) {
			this.datasource.set(data, makePath(this.path, path));
		},

		fetch: function(path) {
			return this.datasource.fetch(makePath(this.path, path));
		},

		update: function(patch) {
			var path = this.path;
			var mapped = patch.map(function(change) {
				return Object.create(change, {
					path: { value: makePath(path, change.path) }
				});
			});

			return this.datasource.update(mapped);
		}
	};

	function makePath(head, tail) {
		return tail == null ? head : head + ensureSlash(tail);
	}

	function ensureSlash(path) {
		return path[0] === '/' ? path : '/' + path;
	}

	return DocumentView;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));
