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

	var guessProp = require('../view/lib/dom').guessProp;
	var domPatch = require('./domPatch');
	var template = require('./template');
	var jsonPointer = require('../lib/jsonPointer');
	var jsonPatch = require('../lib/jsonPatch');

	function Dom(node, events) {
		this.node = template.fromNode(node);
		this._lists = findListTemplates(this.node);
		this._events = normalizeEvents(events);
	}

	Dom.prototype = {
		set: function(data) {
			var observe;
			if(this._observe) {
				observe = this._observe;
				eachNodeEventPair(function(node, event) {
					node.removeEventListener(event, observe);
				}, this._events, this.node);
			}

			observe = this._observe = this._createObserver();
			eachNodeEventPair(function(node, event) {
				node.addEventListener(event, observe, false);
			}, this._events, this.node);

			var self = this;
			return domPatch.set(this.node, data, function(parent, key) {
				var template = self._lists[key];
				if(template) {
					var node = template.cloneNode(true);
					parent.appendChild(node);
					return node;
				}
			});
		},

		diff: function(shadow) {
			return diffDataAndDom(shadow, this.node);
		},

		patch: function(patch) {
			domPatch.patch(this.node, patch, this._lists);
		},

		_createObserver: function() {
			var self = this;
			return function () {
				self.hint(self);
			};
		}
	};

	return Dom;

	function normalizeEvents(events) {
		if (!events) {
			events = { '/': 'change' };
		} else if (typeof events === 'string') {
			events = { '/': events };
		}

		return events;
	}

	function eachNodeEventPair(f, events, root) {
		Object.keys(events).forEach(function(path) {
			var event = events[path];
			event = event.split(/\s*,\s*/);
			event.forEach(function(event) {
				var node = domPatch.find(path, root);

				if(node) {
					f(node, event);
				}
			});
		});
	}

	function findListTemplates(node) {
		var lists = Array.prototype.slice.call(node.querySelectorAll('[data-list]'));
		return lists.reduce(function (lists, list) {
			list.removeAttribute('data-list');
			list.parentNode.removeChild(list);
			lists[buildPath(list, node)] = list;
			return lists;
		}, {});
	}

	function diffDataAndDom(shadow, root) {

		function diff(x, node, patch, path) {
			if(!node) {
				patch.push({
					op: 'remove',
					path: path
				});

				return patch;
			}

			if(x && (Array.isArray(x) || typeof x === 'object')) {
				return Object.keys(x).reduce(function(patch, key) {
					return diff(x[key], domPatch.find(key, node), patch, path ? path + '/' + key : key);
				}, patch);
			}

			var nodeValue = node && node[guessProp(node)];
			if (x !== nodeValue) {
				patch.push({
					op: 'replace',
					path: path,
					value: nodeValue
				});
			}

			return patch;
		}

		return diff(shadow, root, [], '');
	}

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
