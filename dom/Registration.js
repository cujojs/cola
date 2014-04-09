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

	var dom = require('../lib/dom');
	var path = require('../lib/path');
	var domPointer = require('../lib/domPointer');

	function Registration(node) {
		this._root = node;
		this._tree = register({}, '', node);
	}

	Registration.prototype = {
		add: function(path, node) {
			register(this._tree, path, node);
		},

		rebuild: function() {
			this._tree = register({}, '', this._root);
		},

		remove: function(node) {
			var p = domPointer(this._root, node);
			var p2 = p + path.separator;
			var l = p2.length;

			// Prune "subtrees"
			this._tree = Object.keys(this._tree).reduce(function(map, key) {
				if(key === p
					|| (key.length > l && key[l] === path.separator
						&& key.slice(0, l) === p2)) {
					delete map[key];
				}

				return map;
			}, this._tree);
		},

		findNodes: function(path) {
			return find(this._tree, path);
		},

		findPath: function(node) {
			return domPointer(this._root, node);
		}
	};

	return Registration;

	function normalizePath(path) {
		return path && path[0] === '/' ? path.slice(1) : path;
	}

	function find(map, path) {
		return map[normalizePath(path)];
	}

	function register(map, basePath, root) {
		map[basePath] = [root];

		var nodes = root.querySelectorAll('[data-path], [name]');
		return Array.prototype.reduce.call(nodes, function(map, node) {
			var list, p;

			p = domPointer(root, node);

			if(p) {
				if(!path.isAbsolute(p)) {
					p = path.join(basePath, p);
				}

				list = map[p];
				if(!list) {
					map[p] = [node];
				} else {
					list.push(node);
				}
			}
			return map;
		}, map);
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
