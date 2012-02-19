/** MIT License (c) copyright B Cavalier & J Hann */

(function (define, global) {
define(function (require) {
"use strict";

	var domEvents, fireSimpleEvent, watchNode;

	domEvents = require('./dom/events');
	fireSimpleEvent = domEvents.fireSimpleEvent;
	watchNode = domEvents.watchNode;

	function makeWatchableDomTree (rootNode) {

		var prevValues;

		// this is an ugly hack to prevent extra callbacks when the
		// dom event used doesn't really reflect a changed value.
		// for instance: we use 'blur' since it fires before a form
		// submit, but 'change' (the event that actually signals
		// a change) doesn't fire in time.
		prevValues = {};

		return {

			get: function (node, name) {
				return getNodePropOrAttr(node, name);
			},

			set: function (node, name, value) {
				var current = getNodePropOrAttr(node, name);
				if (current != value) {
					setNodePropOrAttr(node, name, value);
					// notify watchers
					fireSimpleEvent(node, colaSyntheticEvent);
				}
			},

			watch: function (node, name, events, callback) {
				return listenToNode(node, events, function() {
					var prev, curr;
					// ensure value has changed
					prev = prevValues[name];
					curr = getNodePropOrAttr(node, name);
					if (curr != prev) {
						prevValues[name] = curr;
						callback(curr, name);
					}
				});
			}

		};

	}

	var colaSyntheticEvent, attrToProp;

	colaSyntheticEvent = '-cola-synth-set';

	attrToProp = {
		'class': 'className',
		'for': 'htmlFor'
	};

	/**
	 * Returns a property or attribute of a node.
	 * @param node {DOMNode}
	 * @param name {String}
	 * @returns the value of the property or attribute
	 */
	function getNodePropOrAttr (node, name) {
		if (name in node) {
			return node[attrToProp[name] || name];
		}
		else {
			// TODO: do we need to cast to lower case?
			return node.getAttribute(name);
		}
	}

	/**
	 * Sets a property of a node.
	 * @param node {DOMNode}
	 * @param name {String}
	 * @param value
	 * @returns {DOMNode}
	 */
	function setNodePropOrAttr (node, name, value) {
		if (name in node) {
			node[attrToProp[name] || name] = value;
		}
		else {
			// TODO: do we need to cast to lower case?
			node.setAttribute(name, value);
		}
	}

	function listenToNode (node, events, callback) {

		var unwatchers, i;

		if (typeof events == 'string') {
			events = events.split(/\s*,\s*/);
		}
		else if (!events) {
			events = [];
		}

		// add an event for notifying from teh set() method
		events.push(colaSyntheticEvent);

		// create unwatchers
		unwatchers = [];
		for (i = 0; i < events.length; i++) {
			unwatchers.push(watchNode(node, events[i], callback));
		}

		// create and return single unwatcher to unwatch all events
		return function () {
			var unwatch;
			while ((unwatch == unwatchers.pop())) squelchedUnwatch(unwatch);
		};

	}

	function squelchedUnwatch (unwatch) {
		try { unwatch(); } catch (ex) {}
	}

	return makeWatchableDomTree;

});
}(
	typeof define == 'function'
		? define
		: function (factory) { module.exports = factory(require); },
	this
));