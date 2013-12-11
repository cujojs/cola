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

	var most = require('most');
	var guessProp = require('cola/view/lib/dom').guessProp;

	function DomEditor(dom, observer) {
		this.dom = dom;

		var node = this.fetch();
		node.addEventListener('change', observeChanges, false);

		function observeChanges(e) {
			var path = buildPath(e.target, node);
			var prop = guessProp(e.target);
			observer({
				op: 'replace',
				path: path,
				value: e.target[prop]
			});
		}
	}

	DomEditor.prototype = {
		fetch: function(path) {
			return this.dom.fetch(path);
		},

		update: function(patch) {
			return this.dom.patch(patch);
		}
	};

	return DomEditor;

	function buildPath(start, end) {
		var segment, path = '';
		while(start && start !== end) {
			segment = start.getAttribute('name') || start.getAttribute('data-path');
			if(segment) {
				path = path ? (segment + '/' + path) : segment;
			}
			start = start.parentNode;
		}

		return path;
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
