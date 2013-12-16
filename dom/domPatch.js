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
	};

	function find(path, root) {
		path = normalizePath(path);

		if(!path) {
			return root;
		}

		return root.querySelector(createQuery(path, true))
			|| root.querySelector(createQuery(path, false));
	}

	function normalizePath(path) {
		return path && path[0] === '/' ? path.slice(1) : path;
	}

	function patch(node, patch, templates) {
		return patch.reduce(function(root, change) {
			var node = find(change.path, root);
			if(node) {
				applyChange(node, change);
			} else {
				var path = change.path;

				path = path && path.replace(/\/[^/]+\/?$/, '');
				var template = templates[path];
				if(template) {
					var parent = find(path, root);
					if(parent) {
						node = template.cloneNode(true);
						node.setAttribute('data-path', normalizePath(change.path));
						parent.appendChild(set(node, change.value, null, path));
					}
				}
			}

			return root;
		}, node);

	}

	function applyChange(node, change) {
		if(change.op === 'replace' || change.op === 'add') {
			set(node, change.value);
		} else if(change.op === 'remove') {
			node.parentNode.removeChild(node);
		}

		return node;
	}

	function createQuery(path, useName) {
		var segments = path.split('/');
		var last = segments.length - 1;

		return segments.map(function(segment, i) {
			return (useName && i === last ? '[name="' : '[data-path="')
				+ segment + '"]';
		}).join(' ');
	}

	function set(node, value, generator, path) {
		if(value != null && typeof value === 'object') {
			return setObject(node, value, generator, path || '');
		} else if(node) {
			node[dom.guessProp(node)] = typeof value === 'function' ? value() : value;
		}

		return node;
	}

	function setObject(node, data, generator, path) {
		return Object.keys(data).reduce(setValues, node);

		function setValues(node, key) {
			var n = node.querySelector('[data-path="' + key + '"]')
				|| node.querySelector('[name="' + key + '"]');

			if(!n && generator) {
				n = generator(node, path);
			}

			if(n) {
				n.setAttribute('data-path',key);
				set(n, data[key], generator, path + '/' + key);
			}

			return node;
		}
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
