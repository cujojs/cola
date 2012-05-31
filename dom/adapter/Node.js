/** MIT License (c) copyright B Cavalier & J Hann */


(function (define) {
define(function (require) {
"use strict";

	var guess, domEvents, watchNode;

	guess = require('../guess');
	domEvents = require('../events');
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
			this._item = item;
			for (var p in item) {
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

			// If there are no bindings for this name, there's
			// no way to divine what property to set.  Give up.
			if(!b) {
				return;
			} else if(b.to) {
				// HACK: Until we change the way bindings are done,
				// this allows binding data props to multiple things.

				// If there's a "to" override, then this binding
				// actually applies to the data property specified
				// by it.

				name = b.to;
			}

			node = this._getNode(b.node, name);

			if (node) {
				prop = 'prop' in b ? b.prop : guess.propForNode(node);
				current = guess.getNodePropOrAttr(node, prop);
				if (current !== value) {
					guess.setNodePropOrAttr(node, prop, value);
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
			if (guess.isNode(selector)) {
				node = selector;
			}
			else if (selector) {
				node = this._options.querySelector(selector, this._rootNode);
			}
			if (!node) {
				node = guess.nodeByName(this._rootNode, name) || this._rootNode;
			}
			return node;
		},

		_watchAllEvents: function () {
			var name, binding, events, node, prop;

			for (name in this._options.bindings) {
				binding = this._options.bindings[name];

				if(binding.to) name = binding.to;

				node = this._getNode(binding.node, name);
				prop = binding.prop || guess.propForNode(node);
				events = binding.event || binding.events;
				if(events == null) {
					events = guess.eventsForNode(node);
				}

				if (events && node && prop) {
					this._watchEvents(node, events, name, prop);
				}
			}
		},

		_watchEvents: function (node, events, name, prop) {
			var self = this;

			this._unwatches.push(listenToNode(node, events, function () {
				var prev, curr;

				prev = self._item[name];
				curr = guess.getNodePropOrAttr(node, prop);

				if (prev !== curr) {
					self._item[name] = curr;
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

	return NodeAdapter;

});
}(
	typeof define == 'function'
		? define
		: function (factory) { module.exports = factory(require); }
));