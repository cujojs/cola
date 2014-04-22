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
	var paths = require('../lib/path');

	function DomBuilder(map, create) {
		this._create = create;
		this._map = map;
	}

	DomBuilder.prototype.patch = function(patch) {
		patch.forEach(function(change) {
			if (change.op === 'replace') {
				this.replace(change.path, change.value);
			} else if (change.op === 'add') {
				this.add(change.path, change.value);
			} else if (change.op === 'remove') {
				this.remove(change.path);
			}
		}, this);
	};

	DomBuilder.prototype.build = function(data) {
		var root = this._map.findNode('');
		return root && this._buildNodeValue('', data, root);
	};

	DomBuilder.prototype._buildNodeValue = function(path, value, node) {
		if(typeof value === 'object' && value !== null) {
			return Object.keys(value).map(function(key) {
				return this._addNodeValue(paths.join(path, key), value[key], node);
			}, this);
		}

		return dom.setValue(node, value);

	};

	DomBuilder.prototype.replace = function(path, value) {
		var node = this._map.findNode(path);
		return node && this._replaceNodeValue(path, value, node);
	};

	DomBuilder.prototype.add = function(path, value) {
		var parent = this._map.findNode(paths.dirname(path));
		return parent && this._addNodeValue(path, value, parent);
	};

	DomBuilder.prototype.remove = function(path) {
		var node = this._map.findNode(path);
		if(!node) {
			return;
		}

		this._map.remove(node);
		var parent = node.parentNode;
		if(parent) {
			parent.removeChild(node);
		}
	};

	DomBuilder.prototype._replaceNodeValue = function(path, value, node) {
		if(typeof value === 'object' && value !== null) {
			return this._replaceNodeValueObject(path, value, node);
		}

		return dom.setValue(node, value);
	};

	DomBuilder.prototype._addNodeValue = function(path, value, node) {
		var list = this._findListChild(node);
		if(list) {
			return this._setNodeValueArray(insertChildAt, path, value, list);
		}

		if(Array.isArray(value)) {
			return this._setNodeValueArray(insertChildAt, path, value, node);
		}

		if(typeof value === 'object' && value !== null) {
			return this._addNodeValueObject(path, value, node);
		}

		var valueNode = this._create(path);
		if(valueNode) {
			this._map.add(path, valueNode);
		}
		return dom.setValue(valueNode, value);
	};

	DomBuilder.prototype._setNodeValueArray = function(insertChild, path, value, list) {
		var i = parseInt(paths.basename(path), 10);
		var replacement = this._create(path);
		var removed = insertChild(list, replacement, i);

		if(removed) {
			this._map.remove(removed);
		}

		this._map.add(path, replacement);

		return this._replaceNodeValue(path, value, replacement);
	};

	DomBuilder.prototype._replaceNodeValueObject = function(path, object /*, node*/) {
		return Object.keys(object).map(function(key) {
			var p = path + '/' + key;
			var value = object[key];

			var node = this._map.findNode(p);
			return node && this._replaceNodeValue(p, value, node);
		}, this)
	};

	DomBuilder.prototype._addNodeValueObject = function(path, object, node) {
		var child = this._create(path);
		node.appendChild(child);
		this._map.add(path, child);

		return this._replaceNodeValue(path, object, child);
	};

	DomBuilder.prototype._findImmediateChildren = function(query, node) {
		// TODO: improve
		return Array.prototype.slice.call(node.querySelector(query));
	};

	DomBuilder.prototype._findListChild = function(node) {
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
	};

	DomBuilder.prototype._findListParent = function(node) {
		if(isListNode(node)) {
			return node;
		}

		if(node.parentNode && isListNode(node.parentNode)) {
			return node.parentNode;
		}
	};

	function replaceChildAt(parent, replacement, i) {
		var child = parent.children[i];

		if(child) {
			child.parentNode.replaceChild(replacement, child);
		} else {
			throw new Error('Invalid path ' + i);
		}

		return child;
	}

	function insertChildAt(parent, newNode, i) {
		var children = parent.children;

		if(i < children.length) {
			parent.insertBefore(newNode, children[i]);
		} else {
			parent.appendChild(newNode);
		}
	}

	return DomBuilder;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
