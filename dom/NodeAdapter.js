/** MIT License (c) copyright B Cavalier & J Hann */


(function (define) {
define(function (require) {
"use strict";

	var domEvents, classList, watchNode;

	domEvents = require('./events');
	classList = require('./classList');
	watchNode = domEvents.watchNode;

	/**
	 * Creates a cola adapter for interacting with dom nodes.  Be sure to
	 * unwatch any watches to prevent memory leaks in Internet Explorer 6-8.
	 * @constructor
	 * @param rootNode {Node}
	 * @param options {Object}
	 */
	function NodeAdapter (rootNode, options) {

		this._rootNode = rootNode;

		// set options
		this._options = options || {};

		// keep data values
		this._values = {};

		// flag to avoid circles when updating from an event
		this._updating = false;

		// event unwatchers to be called to prevent memory leaks in IE
		this._unwatches = [];

		this._watchAllEvents();

	}

	NodeAdapter.prototype = {

		getOptions: function () {
			return this._options;
		},

		update: function (item) {
			var p;
			if (this._updating) return;
			this._item = item;
			for (p in item) {
				this._setProperty(p, item[p]);
			}
		},

		destroy: function () {
			var unwatches = this._unwatches;
			while (unwatches.length) unwatches.pop()();
		},

		/**
		 * Changes the value of a node attribute mapped from an item property.
		 * @param name {String} the name of the property
		 * @param value the new value of the property
		 */
		_setProperty: function (name, value) {
			var b, node, prop, current;
			b = this._getBindingsFor(name);
			if(b && b.to) name = b.to;
			node = b && this._getNode(b.node, name);
			if (b && node) {
				prop = 'prop' in b ? b.prop : guessPropFor(node);
				current = getNodePropOrAttr(node, prop);
				this._values[name] = current;
				if (current !== value) {
					setNodePropOrAttr(node, prop, value);
				}
			}
		},

		/**
		 * Returns the binding info for a node, if it exists.
		 * @param name {String} the name of the node
		 * @returns {Object} {
		 *     node: aNode,
		 *     prop: 'aProp',
		 *     events: 'event1,event2' // optional
		 * }
		 */
		_getBindingsFor: function (name) {
			var bindings, binding;
			bindings = this._options.bindings;
			if (bindings && name in bindings) {
				binding = bindings[name];
			}
			return binding;
		},

		_getNode: function (selector, name) {
			// TODO: cache querySelector lookups?
			var node;
			if (isDomNode(selector)) {
				node = selector;
			}
			else if (selector) {
				node = this._options.querySelector(selector, this._rootNode);
			}
			if (!node) {
				node = guessNode(this._rootNode, name) || this._rootNode;
			}
			return node;
		},

		_watchAllEvents: function () {
			var name, binding, events, node, prop;
			for (name in this._options.bindings) {
				binding = this._options.bindings[name];
				if(binding.to) name = binding.to;
				events = binding.event || binding.events;
				node = this._getNode(binding.node, name);
				prop = binding.prop || guessPropFor(node);
				if (events && node && prop) {
					this._watchEvents(node, events, name, prop);
				}
			}
		},

		_watchEvents: function (node, events, name, prop) {
			var self, currValues;
			self = this;
			currValues = this._values;
			this._unwatches.push(listenToNode(node, events, function (e) {
				var prev, curr;//, partial;
				prev = currValues[name];
				curr = getNodePropOrAttr(node, prop);
				if (prev !== curr) {
//					partial = {};
					self._item[name] = currValues[name] = curr;
					self._updating = true;
					try {
						self.update(self._item);
					}
					finally {
						self._updating = false;
					}
				}
			}));
		}

	};

	/**
	 * Tests whether the given object is a candidate to be handled by
	 * this adapter. Returns true if this is a DOMNode (or looks like one).
	 * @param obj
	 * @returns {Boolean}
	 */
	NodeAdapter.canHandle = function (obj) {
		// crude test if an object is a node.
		return obj && obj.tagName && obj.getAttribute && obj.setAttribute;
	};

	var propUpdatedEvent, attrToProp, customAccessors;

	propUpdatedEvent = 'ColaItemPropUpdated';

	attrToProp = {
		'class': 'className',
		'for': 'htmlFor'
	};

	customAccessors = {
		classList: {
			get: classList.getClassList,
			set: classList.setClassList
		},
		classSet: {
			get: classList.getClassSet,
			set: classList.setClassSet
		}
	};

	/**
	 * Returns a property or attribute of a node.
	 * @param node {Node}
	 * @param name {String}
	 * @returns the value of the property or attribute
	 */
	function getNodePropOrAttr (node, name) {
		var accessor;
		accessor = customAccessors[name];
		if (accessor) {
			return accessor.get(node);
		}
		else if (name in node) {
			return node[attrToProp[name] || name];
		}
		else {
			// TODO: do we need to cast to lower case?
			return node.getAttribute(name);
		}
	}

	/**
	 * Sets a property of a node.
	 * @param node {Node}
	 * @param name {String}
	 * @param value
	 */
	function setNodePropOrAttr (node, name, value) {
		var accessor;
		accessor = customAccessors[name];
		if (accessor) {
			return accessor.set(node, value);
		}
		else if (name in node) {
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

	/**
	 * Crude way to find a node under the current node. This is just a
	 * default implementation. A better one should be injected by
	 * the environment.
	 * @private
	 * @param rootNode
	 * @param nodeName
	 */
	function guessNode (rootNode, nodeName) {
		// use form.elements if this is a form
		if (/^form$/i.test(rootNode.tagName)) {
			return rootNode.elements[nodeName];
		}
		// use getElementById, if not a form (yuk!)
		else {
			return rootNode.ownerDocument.getElementById(nodeName);
		}
	}

	function guessEventsFor (node) {
		if (/^input$/i.test(node.tagName) || /^select$/i.test(node.tagName)) {
			return ['change', 'blur'];
		}
		else {
			return [];
		}
	}

	function guessPropFor (node) {
		if (/^input$/i.test(node.tagName) || /^select$/i.test(node.tagName)) {
			return 'value';
		}
		else {
			return 'innerHTML';
		}
	}

	function isDomNode (obj) {
		return (typeof HTMLElement != 'undefined' && obj instanceof HTMLElement)
			|| (obj && obj.tagName && obj.getAttribute);
	}

	function noop () {}

	return NodeAdapter;

});
}(
	typeof define == 'function'
		? define
		: function (factory) { module.exports = factory(require); },
	this
));