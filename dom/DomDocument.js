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

	var path = require('../lib/path');
	var guessProp = require('../view/lib/dom').guessProp;
	var jsonPointer = require('../lib/jsonPointer');

	function DomDocument(registration, generator) {
		this.reg = registration;
		this.gen = generator;
	}

	DomDocument.prototype = {
		diff: function(data) {
			return diffDataAndDom(data, this.reg);
		},

		patch: function(patch) {
			return patchDom(this.reg, this.gen, patch);
		},

		set: function(path, value) {
			return set(this.reg.findNodes(''), this.reg, path, this.gen, value);
		},

		findPath: function(node) {
			return this.reg.findPath(node);
		},

		findNodes: function(path) {
			return this.reg.findNodes(path);
		}
	};

	return DomDocument;

	function diffDataAndDom(data, reg) {

		var seen = {};

		var patch = diff([], '', data, reg.findNodes(''));

		return Object.keys(reg._map).reduce(function(patch, path) {
			var pointer = jsonPointer.find(data, path);
			if(pointer && !(path in seen) && !isContainer(pointer.target[pointer.key])) {
				var nodes = reg.findNodes(path);
				if(nodes && nodes.length > 0) {
					patch.push({
						op: 'add',
						path: path,
						value: getValue(nodes[0])
					});
				}
			}
			return patch;
		}, patch);

		function diff(patch, basePath, value, nodes) {
			var nodeValue;

			seen[basePath] = 1;

			if(isContainer(value)) {
				return bfs(patch, basePath, value);
			}

			nodeValue = getValue(nodes[0]);
			if(nodeValue !== value) {
				patch.push({
					op: 'replace',
					path: basePath,
					value: nodeValue
				});
			}
			return patch;
		}

		function bfs(patch, basePath, data) {
			return Object.keys(data).reduce(function(patch, key) {

				var local = path.join(basePath, key);
				var nodes = reg.findNodes(local);

				if(nodes.length > 0) {
					return diff(patch, local, data[key], nodes);
				} else {
					patch.push({
						op: 'remove',
						path: local
					})
				}

				return patch;
			}, patch);
		}
	}

	function normalizePath(path) {
		return path && path[0] === '/' ? path.slice(1) : path;
	}

	function isContainer(x) {
		return x && !(x instanceof Date) && (Array.isArray(x) || typeof x === 'object');
	}

	function getValue(node) {
		return node[guessProp(node)];
	}

	function patchDom(reg, generator, patch) {
		return patch.reduce(function(reg, change) {
			var path = normalizePath(change.path);
			var nodes = reg.findNodes(path);

			if(!nodes) {
				var ancestorPath = findDeepest(reg, path);
				if(ancestorPath != null) {
					var node;
					if(generator) {
						node = generator(node, ancestorPath);
						reg.add(path, node);
					}

					node.setAttribute('data-path', path);
					setOne(node, reg, change.path, generator, change.value);
				}
			} else {
				nodes.forEach(function(node) {
					applyChange(node, reg, change);
				});
			}
		}, reg);
	}

	function findDeepest(reg, p) {
		var nodes;
		while(!nodes && p) {
			p = path.split(p);
			p = p.slice(0, p.length-1);
			p = p.join('/');
			nodes = reg.findNodes(p);
		}

		return p;
	}

	function applyChange(node, reg, change) {
		if(change.op === 'replace' || change.op === 'add') {
			setOne(node, reg, '', null, change.value);
		} else if(change.op === 'remove') {
			node.parentNode.removeChild(node);
		}

		return node;
	}

	function set(nodes, reg, path, generator, value) {
		nodes.forEach(function(node) {
			setOne(node, reg, path, generator, value);
		});
	}

	function setOne(node, reg, path, generator, value) {
		if(value != null && typeof value === 'object') {
			return setObject(node, reg, path || '', generator, value);
		} else if(node) {
			node[guessProp(node)] = value;
		}
	}

	function setObject(node, reg, p, generator, data) {
		return Object.keys(data).reduce(setValues, node);

		function setValues(node, key) {
			var subpath = path.join(p, key);
			var nodes = reg.findNodes(subpath);

			if(!nodes) {
				var n;
				if(generator) {
					n = generator(node, reg.findPath(node));
					reg.add(subpath, n);
				}

				if(n) {
					updateNode(n);
				}
			} else {
				nodes.forEach(updateNode);
			}

			function updateNode(node) {
				node.setAttribute('data-path', key);
				setOne(node, reg, subpath, generator, data[key]);
			}

			return node;
		}
	}


});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
