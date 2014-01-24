/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author Brian Cavalier
 * @author John Hann
 */

(function(define) { 'use strict';
define(function() {

	var reduce = Array.prototype.reduce;
	var eventAttrs = {
		'data-on-click': 'click',
		'data-on-submit': 'submit',
		'data-on-keyup': 'keyup'
	};
	var eventTypes = Object.keys(eventAttrs).reduce(function(types, attr) {
		types[eventAttrs[attr]] = attr;
		return types;
	}, {});

	function EventDispatcher(handler, root) {
		this.handler = runHandler;
		this.node = root;

		var events = this.events = findEventTypes(root);
		Object.keys(events).forEach(function(key) {
			root.addEventListener(events[key], runHandler, false);
		});

		function runHandler(e) {
			findTarget(handler, root, e);
		}

		function findTarget(handler, root, e) {
			var type = e.type;

			if(!(type in eventTypes)) {
				return;
			}

			var target = e.target;
			var attr;
			do {
				attr = target.getAttribute(eventTypes[type]);
				if(attr) {
					return handler(e, target, attr);
				}
			} while(target !== root && (target = target.parentNode));
		}
	}

	EventDispatcher.prototype = {
		dispose: function() {
			var events = this.events;
			var handler = this.handler;
			var root = this.root;
			Object.keys(events).forEach(function(key) {
				console.log(events[key]);
				root.removeEventListener(events[key], handler, false);
			});
		}
	};

	return EventDispatcher;

	function findEventTypes(root, allowed) {
		if(!allowed) {
			allowed = eventAttrs;
		}

		return foldt(root, function(events, node) {
			return reduce.call(node.attributes, function(events, attr) {
				if(attr.name in allowed) {
					events[attr.name] = allowed[attr.name];
				}
				return events;
			}, events);
		}, {});
	}

	function foldt(root, f, initial) {
		var result = reduce.call(root.children, function(result, child) {
			return child.nodeType === 1
				? foldt(child, f, result)
				: result;
		}, initial);

		return f(result, root);
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));
