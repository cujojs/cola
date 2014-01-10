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

	function Registration(node) {
		this._root = node;
		this._map = register({}, '', node);
	}

	Registration.prototype = {
		add: function(path, node) {
			register(this._map, path, node);
		},

		rebuild: function() {
			this._map = register({}, '', this._root);
		},

		remove: function(/* TODO: incremental removal */) {
			this.rebuild();
		},

		findNodes: function(path) {
			return find(this._map, path);
		},

		findPath: function(node) {
			return buildPath(this._root, node);
		}
	};

	Registration.buildPath = buildPath;

	return Registration;

	function buildPath(end, start) {
		var segment, p = '';
		while(start && start !== end) {
			segment = start.getAttribute('name') || start.getAttribute('data-path');
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

	function register(map, basePath, root) {
		map[basePath] = [root];

		var nodes = root.querySelectorAll('[data-path], [name]');
		return Array.prototype.reduce.call(nodes, function(map, node) {
			var list, p;

			p = buildPath(root, node);

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
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));
