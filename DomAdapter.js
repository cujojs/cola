/** MIT License (c) copyright B Cavalier & J Hann */

(function (define, global) {
define(function (require) {
"use strict";

	var makeWatchable, undef;

	makeWatchable = require('./WatchableDomTree');

	/**
	 * Creates a cola adapter for interacting with dom nodes.  Be sure to
	 * unwatch any watches to prevent memory leaks in Internet Explorer 6-8.
	 * @constructor
	 * @param rootNode {DOMNode}
	 */
	function DomAdapter(rootNode) {
		var self = this;

		this._rootNode = rootNode;
		this._watchable = makeWatchable(rootNode);

		// set blank bindings
		this.setBindings({});
	}

	DomAdapter.prototype = {

		/**
		 * Sets the binding info for this dom tree.
		 * @param bindings
		 */
		setBindings: function (bindings) {
			this._bindings = bindings;
		},

		/**
		 * Watches a specific property and calls back when it changes.
		 * @param name {String} the name of the property to watch.
		 * @param callback {Function} function (propValue, propName) {}
		 * @returns {Function} a function to call when done watching.
		 */
		watch: function (name, callback) {
			var b, watchable;
			b = this._getBindings(name);
			watchable = this._watchable;
			return watchable.watch(b.node, b.prop, b.events, function (value) {
				callback(value, name);
			});
		},

		/**
		 * Watches all nodes that have explicit bindings.
		 * Due to lack of bubbling support for many events, we can't
		 * just listen at the root node. Instead, we have to just
		 * listen to all the nodes that are explicitly bound.
		 * @param callback {Function} function (propValue, propName) {}
		 * @returns {Function} a function to call when done watching.
		 */
		watchAll: function (callback) {
			var unwatchers;
			unwatchers = [];
			for (var p in this._bindings) {
				unwatchers.push(this.watch(p, callback));
			}
			return function () {
				var unwatcher;
				while ((unwatcher = unwatchers.pop())) unwatcher();
			}
		},

		/**
		 * Signals that a property in a synchronized object has changed.
		 * @param value the value of the changed property
		 * @param name {String} the name of the changed property
		 */
		propChanged: function (value, name) {
			var binding = this._getBindings(name);
			this._watchable.set(binding.node, binding.prop, value);
		},

		/**
		 * Returns the binding info for a node, if it exists.
		 * @param name {String} the name of the node
		 * @returns {Object} {
		 *     node: aNode,
		 *     prop: 'aProp',
		 *     attr: 'anAttr', // optional
		 *     events: 'event1,event2' // optional
		 * }
		 */
		_getBindings: function (name) {
			var bindings, binding;
			bindings = this._bindings;
			if (name in bindings) {
				binding = bindings[name];
			}
			else {
				binding = {
					prop: 'innerHTML',
					// TODO: should we pass these or none?
					events: ['change', 'blur']
				};
			}
			if (!('node' in binding)) {
				binding.node = guessNode(this._rootNode, name);
			}
			return binding;
		}

	};

	/**
	 * Tests whether the given object is a candidate to be handled by
	 * this adapter. Returns true if this is a DOMNode (or looks like one).
	 * @param obj
	 * @returns {Boolean}
	 */
	DomAdapter.canHandle = function (obj) {
		// crude test if an object is a node.
		return obj && obj.tagName && obj.getAttribute && obj.setAttribute;
	};

	return DomAdapter;

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

});
}(
	typeof define == 'function'
		? define
		: function (factory) { module.exports = factory(require); },
	this
));