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
	var jsonPointer = require('../lib/jsonPointer');

	function Registration(node) {
		this._root = node;
		this.rebuild();
	}

	Registration.prototype = {
		add: function(path, node) {
			register(this._tree, path, node);
		},

		rebuild: function() {
			this._tree = register({}, '', this._root);
		},

		remove: function(node) {
			var p = buildPath(this._root, node);
			removeOne(p, node, this._tree);
		},

		findNodes: function(path) {
			var n = findTreeNode(path, this._tree);
			return n && n.nodes;
		},

		findPath: function(node) {
			return buildPath(this._root, node);
		},

		reduce: function(f, initial) {

		}
	};

	Registration.buildPath = buildPath;

	return Registration;

	function buildPath(end, start) {
		var segment, p = '';
		while(start && start !== end) {
			segment = start.getAttribute('data-path') || start.getAttribute('name');
			p = path.join(segment, p);

			if(path.isAbsolute(p)) {
				start = end;
			}
			start = start.parentNode;
		}

		return p;
	}

	function normalizePath(path) {
		return path && path[0] === '/' ? path.slice(1) : path;
	}

	function find(map, path) {
		return map[normalizePath(path)];
	}

	function register(tree, basePath, root) {
		addOne(basePath, root, tree);

		var nodes = root.querySelectorAll('[data-path], [name]');
		return Array.prototype.reduce.call(nodes, function(tree, node) {
			var p = buildPath(root, node);

			if(p) {
				if(!path.isAbsolute(p)) {
					p = path.join(basePath, p);
				}

				addOne(p, node, tree);
			}
			return tree;
		}, tree);
	}

	function findTreeNode (p, tree) {
		return path.split(p).reduce(function (node, key) {
			var child = node.children[key];
			if (!child) {
				child = node.children[key] = {
					children: {}
				}
			}
			return child;
		}, tree);
	}

	function addOne(p, node, tree) {
		var leaf = findTreeNode(p, tree);

		var nodes = leaf.nodes;
		if(!nodes) {
			nodes = [node];
		} else {
			nodes.push(node);
		}
	}

	function removeOne(p, node, tree) {
		var prev, prevKey;
		var leaf = path.split(p).reduce(function(node, key) {
			var child = node.children[key];
			if(!child) {
				child = node.children[key] = {
					children: {}
				}
			}
			prev = child;
			prevKey = key;
			return child;
		}, tree);

		if(leaf.nodes) {
			leaf.nodes.some(function(n, i, nodes) {
				if(n === node) {
					nodes.splice(i, 1);
					return true;
				}
			});

			if(leaf.nodes.length === 0 && prev !== leaf) {
				delete prev.children[prevKey];
			}
		}
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));
