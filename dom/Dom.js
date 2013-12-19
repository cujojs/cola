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
	var Registration = require('./Registration');
	var DomDocument = require('./DomDocument');
	var template = require('./template');

	function Dom(node, events) {
		this.node = template.replaceNode(node);
		this._lists = findListTemplates(this.node);

		var self = this;
		this._doc = new DomDocument(new Registration(this.node), function(parent, key) {
			return self._generateNode(parent, key);
		});

		this._events = normalizeEvents(events);
	}

	Dom.prototype = {
		set: function(data) {
			var observe;
			if(this._observe) {
				observe = this._observe;
				eachNodeEventPair(function(node, event) {
					node.removeEventListener(event, observe);
				}, this._events, this._doc);
			}

			observe = this._observe = this._createObserver();
			eachNodeEventPair(function(node, event) {
				node.addEventListener(event, observe, false);
			}, this._events, this._doc);

			return this._doc.set('', data);
		},

		diff: function(shadow) {
			var diff = this._doc.diff(shadow);
			return  diff;
		},

		patch: function(patch) {
			this._doc.patch(patch);
		},

		_createObserver: function() {
			var self = this;
			return function (e) {
				var node = e.target;
				var path = self._doc.findPath(node);
				self._syncNodes(node, path);
				self.hint(self);
			};
		},

		_syncNodes: function(sourceNode, path) {
			var nodes = this._doc.findNodes(path);
			nodes.forEach(function(n) {
				if(n !== sourceNode) {
					n[guessProp(n)] = sourceNode[guessProp(sourceNode)];
				}
			});
		},

		_generateNode: function(parent, key) {
			var t = this._lists[key];
			if(t) {
				var node = t.template.cloneNode(true);
				t.parent.appendChild(node);
				return node;
			}
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

	function eachNodeEventPair(f, events, reg) {
		Object.keys(events).forEach(function(path) {
			var event = events[path];
			event = event.split(/\s*,\s*/);
			event.forEach(function(event) {
				var nodes = reg.findNodes(path);
				nodes.forEach(function(node) {
					f(node, event);
				});
			});
		});
	}

	function findListTemplates(root) {
		var lists = Array.prototype.slice.call(root.querySelectorAll('[data-list]'));
		return lists.reduce(function (lists, list) {
			list.removeAttribute('data-list');
			lists[Registration.buildPath(root, list)] = {
				template: list,
				parent: list.parentNode
			};

			list.parentNode.removeChild(list);

			return lists;
		}, {});
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
