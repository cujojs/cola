/** MIT License (c) copyright B Cavalier & J Hann */

(function (define, global) {
define(function (require) {
"use strict";

	var makeWatchable, colaSyntheticEvent, undef;

//	colaSyntheticEvent = '-cola-notify';

	makeWatchable = require('./WatchableDomTree');

	/**
	 * Creates a cola adapter for interacting with dom nodes.  This adapter
	 * has a destroyAll function which must be called to prevent memory leaks
	 * in Internet Explorer 6-8.
	 * @constructor
	 * @param node {DOMNode}
	 */
	function DomAdapter(node) {
		var self = this;

		this._rootNode = node;

		this._watchable = makeWatchable(node);
		this._watchable.setNameResolver(function (name) {
			return self._resolveName(name);
		});

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
		watchProp: function (name, callback) {
			return this._watchable.watch(name, callback);
		},

		/**
		 * Watches all nodes that have explicit bindings.
		 * Due to lack of bubbling support for many events, we can't
		 * just listen at the root node. Instead, we have to just
		 * listen to all the nodes that are explicitly bound.
		 * @param callback {Function} function (propValue, propName) {}
		 * @returns {Function} a function to call when done watching.
		 */
		watchAllProps: function (callback) {
			var unwatchers;
			unwatchers = [];
			for (var p in this._options.bindings) {
				unwatchers.push(this.watchProp(p, callback));
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
			this._watchable.set(name, value);
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
		_resolveName: function (name) {
			var bindings;
			bindings = this.bindings;
			if (name in bindings && bindings[name].node) {
				return bindings[name];
			}
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

});
}(
	typeof define == 'function'
		? define
		: function (factory) { module.exports = factory(require); },
	this
));