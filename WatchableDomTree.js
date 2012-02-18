/** MIT License (c) copyright B Cavalier & J Hann */

(function (define, global) {
define(function () {
"use strict";

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

	var colaSyntheticEvent, attrToProp, watchNode, fireSimpleEvent, allUnwatches;

	colaSyntheticEvent = '-cola-synth-set';

	attrToProp = {
		'class': 'className',
		'for': 'htmlFor'
	};

	allUnwatches = [];

	function has(feature) {
		var test = has.cache[feature];
		if (typeof test == 'function') {
			// run it now and cache result
			test = (has.cache[feature] = has.cache[feature]());
		}
		return test;
	}

	has.cache = {
		"dom-addeventlistener": function () {
			return document && 'addEventListener' in document || 'addEventListener' in global;
		},
		"dom-createevent": function () {
			return document && 'createEvent' in document;
		}
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

	if (has('dom-addeventlistener')) {
		// standard way
		watchNode = function (node, name, callback) {
			node.addEventListener(name, callback, false);
			return function () {
				node && node.removeEventListener(name, callback, false);
			}
		};
	}
	else {
		// try IE way
		watchNode = function (node, name, callback) {
			var handlerName, unwatch;
			handlerName = 'on' + name;
			node.attachEvent(handlerName, callback);
			unwatch = function () {
				node && node.detachEvent(handlerName, callback);
			};
			// wish there was a way to has("dom-messedup-garbage-colector")
			// we're using inference here, but wth! it's IE 6-8
			allUnwatches.push(unwatch);
			return unwatch;
		};
		// set global unwatcher
		// oh IE, you pile o' wonder
		watchNode(global, 'unload', function () {
			var unwatch;
			while ((unwatch = allUnwatches.pop())) squelchedUnwatch(unwatch);
		})
	}

	if(has('dom-createevent')) {
		fireSimpleEvent = function (node, type) {
			// don't bubble since most form events don't anyways
			var evt = document.createEvent('HTMLEvents');
			evt.initEvent(type, false, true);
			node.dispatchEvent(evt);
		}
	}
	else {
		fireSimpleEvent = function (node, type) {
			var evt = document.createEventObject();
			node.fireEvent('on' + type, evt);
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
		: function (factory) { module.exports = factory(); },
	this
));