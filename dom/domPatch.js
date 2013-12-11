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

	var dom = require('../view/lib/dom');

	return {
		find: find,
		patch: patch,
		set: set,
		applyChange: applyChange
	}

	function find(path, root) {
		if(!path) {
			return root;
		}

		if(path[0] === '/') {
			path = path.slice(1);
		}

		return root.querySelector(createQuery(path, true))
			|| root.querySelector(createQuery(path, false));
	}

	function patch(node, patch) {
		return patch.reduce(function(root, change) {
			var node = find(change.path, root);
			if(node) {
				applyChange(node, change);
			}
		}, node);

	}

	function applyChange(node, change) {
		var prop = dom.guessProp(node);
		if(change.op === 'replace') {
			set(node, change.value);
		} else if(change.op === 'remove') {
			node[prop] = '';
		}
	}

	function createQuery(path, useName) {
		var segments = path.split('/');
		var last = segments.length - 1;

		return segments.map(function(segment, i) {
			return (useName && i === last ? '[name="' : '[data-path="')
				+ segment + '"]';
		}).join(' ');
	}

	function set(node, value) {
		if(value != null && typeof value === 'object') {
			return setObject(node, value);
		} else if(node) {
			node[dom.guessProp(node)] = value;
		}
		return node;
	}

	function setObject(node, data) {
		return Object.keys(data).reduce(setValues, node);

		function setValues(node, key) {
			var n = node.querySelector('[data-path="' + key + '"]')
				|| node.querySelector('[name="' + key + '"]');

			set(n, data[key]);

			return node;
		}
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
