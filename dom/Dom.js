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
	var dom = require('../lib/dom');
	var domPointer = require('../lib/domPointer');
	var DomTreeMap = require('./DomTreeMap');
	var DomBuilder = require('./DomBuilder');
	var diff = require('./diff');
	var template = require('./template');
	var requestAnimationFrame = require('./requestAnimationFrame');

	var ap = Array.prototype;

	function Dom(node, events) {
		this.node = template.replaceContents(node);
		this._lists = findListTemplates(this.node);

		var self = this;
		this._DomTreeMap = new DomTreeMap(this.node);
		this._builder = new DomBuilder(this._DomTreeMap, function(path) {
			return self._generateNode(path);
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
			}, this._events, this._DomTreeMap);

			this._builder.build(data);
		},

		diff: function(shadow) {
			if(!this._hasChanged) {
				return;
			}
			this._hasChanged = false;
			return diff(this._DomTreeMap, shadow);
		},

		patch: function(patch) {
			var builder = this._builder;
			requestAnimationFrame(function() {
				builder.patch(patch)
			});
		},

		_createObserver: function() {
			var self = this;
			return function (e) {
				self._hasChanged = true;
				self.changed();
			};
		},

		_generateNode: function(path) {
			var key = paths.dirname(path);
			var t = this._lists[key];
			if(t) {
				var node = t.template.cloneNode(true);
				return node;
			}
		},

		changed: function() {}
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
				var node = reg.findNode(path);
				node && f(node, event);
			});
		});
	}

	function findListTemplates(root) {
		var lists = ap.slice.call(root.querySelectorAll('[data-list]'));
		return lists.reduce(function (lists, list) {
			list.removeAttribute('data-list');
			list.parentNode.setAttribute('data-list', '');

			var path = domPointer(root, list);

			lists[paths.dirname(path)] = {
				template: list,
				parent: list.parentNode
			};

			list.parentNode.removeChild(list);

			return lists;
		}, {});
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
