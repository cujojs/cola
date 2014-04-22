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

	var paths = require('../lib/path');
	var domPointer = require('../lib/domPointer');

	function Registration(node) {
		this._root = node;
		this.rebuild();
	}

	Registration.prototype = {
		rebuild: function() {
			this._tree = build(this._root);
		},

		add: function(path, node) {
			insert(this._tree, path, node);
		},

		replace: function(path, node) {
			replace(this._tree, path, node);
		},

		remove: function(node) {
			remove(this._tree, domPointer(this._root, node));
		},

		findNode: function(path) {
			return findNode(this._tree, path);
		}
	};

	return Registration;

	function remove(tree, path) {
		var t = findParent(tree, path);
		if(t) {
			var key = paths.basename(path);
			if(t.isList) {
				t.list.splice(parseInt(key, 10), 1);
			} else {
				delete t.hash[key];
			}
		}
	}

	function replace(tree, path, node) {
		var t = findParent(tree, path);
		if(t) {
			var key = paths.basename(path);
			if(t.isList) {
				t.list[key] = build(node);
			} else {
				t.hash[key] = build(node);
			}
		}
	}

	function insert(tree, path, node) {
		var t = findParent(tree, path);
		if(t) {
			var key = paths.basename(path);
			if(t.isList) {
				t.list.splice(parseInt(key, 10), 0, build(node));
			} else {
				t.hash[key] = build(node);
			}
		}
	}

	function findNode(tree, path) {
		var t = findParent(tree, path);
		var key = paths.basename(path);
		if(key) {
			t = t && getSubtree(t, key);
		}
		return t && t.node;
	}

	function findParent(tree, path) {
		var parts = paths.split(paths.dirname(path));
		return parts.reduce(function(tree, part) {
			return (tree && part) ? getSubtree(tree, part) : tree;
		}, tree);
	}

	function getSubtree(tree, key) {
		return tree && tree.isList ? tree.list[key] : tree.hash[key]
	}

	function build(node) {
		return appendChildren({ node: node, hash: {}, list: [], isList: false }, node);
	}

	function appendChildren(tree, node) {
		if(domPointer.isListNode(node)) {
			tree.isList = true;
			return appendListChildren(tree, node.children);
		}

		return appendHashChildren(tree, node.children);
	}

	function appendListChildren(tree, children) {
		var list = tree.list;
		for(var i=0; i<children.length; ++i) {
			list.push(build(children[i]));
		}
		return tree;
	}

	function appendHashChildren(tree, children) {
		var hash = tree.hash;
		var i, child;
		for(i=0; i<children.length; ++i) {
			child = children[i];
			if(child.hasAttribute('data-path')) {
				hash[child.getAttribute('data-path')] = build(child);
			} else if(child.hasAttribute('name')) {
				hash[child.getAttribute('name')] = build(child);
			} else {
				appendChildren(tree, child);
			}
		}
		return tree;
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
