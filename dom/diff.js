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
	var isListNode = require('../lib/domPointer').isListNode;
	var path = require('../lib/path');

	return function diffDataAndDom(reg, data) {
		return diff(reg, {}, [], '', data, reg.findNode(''));
	};

	function diff(reg, seen, patch, basePath, value, node) {
		var nodeValue;

		seen[basePath] = 1;

		if(isContainer(value)) {
			return bfs(reg, seen, patch, basePath, value);
		}

		nodeValue = dom.getValue(node);
		if(nodeValue != value) {
			patch.push({
				op: 'replace',
				path: basePath,
				value: nodeValue
			});
		}
		return patch;
	}

	function bfs(reg, seen, patch, basePath, data) {
		if(Array.isArray(data)) {
			return diffArray(reg, seen, patch, basePath, data);
		}

		return Object.keys(data).reduce(function(patch, key) {

			var local = path.join(basePath, key);
			var node = reg.findNode(local);

			if(node) {
				return diff(reg, seen, patch, local, data[key], node);
			} else {
				patch.push({
					op: 'remove',
					path: local
				});
			}

			return patch;
		}, patch);
	}

	function diffArray(reg, seen, patch, basePath, array) {
		var parent = reg.findNode(basePath);
		var list = findListChild(parent);
		if(!list) {
			// TODO: throw?
			return patch;
		}

		return array.reduce(function(patch, value, i) {
			return diff(reg, seen, patch, path.join(basePath, ''+i), value, list.children[i]);
		}, patch);
	}

	function isContainer(x) {
		return x && !(x instanceof Date) && (Array.isArray(x) || typeof x === 'object');
	}

	function findListChild(node) {
		if(isListNode(node)) {
			return node;
		}

		var children = node.children;
		for(var i=0; i<children.length; ++i) {
			node = children[i];
			if(isListNode(node)) {
				return node;
			}
		}
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
