define(function () {
"use strict";

	var undef;

	/**
	 * Creates a cola adapter for interacting with dom nodes.  This adapter
	 * has a destroyAll function which must be called to prevent memory leaks
	 * in Internet Explorer 6-8.
	 * @constructor
	 * @param node {DOMNode}
	 */
	function DomAdapter(node) {
		this._rootNode = node;
		// array of listeners that need to be disconnected
		this._unwatches = [];
	}

	DomAdapter.prototype = {

		/**
		 * Translates a name to a property or sub-object. For the DomAdapter,
		 * this resolves to a node under the root node.  This method is
		 * purposely simplistic. Implementors/environments should override
		 * it or inject a better method.
		 * @param name {String} the name of the node
		 * @returns {DOMNode}
		 */
		resolveName: function (name) {
			var node, bindings;
			bindings = this._options.bindings;
			if (name in bindings) {
				node = bindings[name];
			}
			else {
				node = guessNode(this._rootNode, name);
			}
			return node;
		},

		setOptions: function (options) {
			this._options = beget(options);
			// ensure we have bindings for simpler code elsewhere
			if (!this._options.bindings) this._options.bindings = {};
		},

		watchProp: function (name, callback) {
			// TODO: figure out which events can be bubbled to _rootNode and which need to be on node directly
			var node, events, attr, unwatchers, unwatcher, i;

			// find node that this name references
			node = this._findNode(name);

			// get the events
			events = this._getOptionForBinding(name, 'event') || this._getOptionForBinding(name, 'events') || [];
			if (typeof events == 'string') {
				events = events.split(/\s*,\s*/);
			}

			// the mediator doesn't know the details of the dom bindings and
			// so will call watchProp even if no events are specified
			// TODO: throw instead?
			if (events.length > 0) {

				// determine if we're using an attr
				attr = this._getOptionForBinding(name, 'attr');

				// create unwatchers
				unwatchers = [];
				for (i = 0; i < events.length; i++) {
					unwatchers.push(watchNode(node, events[i], function (e) {
						callback(getNodeProp(node, attr || name, !!attr), name);
					}));
				}

				// create and return single unwatcher to unwatch all events
				unwatcher = function () {
					var unwatch;
					while ((unwatch == unwatchers.pop())) squelchedUnwatch(unwatch);
				};
				this._unwatches.push(unwatcher);

			}

			// don't return an inline function(){} or we'll have an unnecessary
			// closure hanging around in memory in less-than-stellar js engines.
			return unwatcher || noop;
		},

		/**
		 * Watches all nodes that have explicit bindings.
		 * Due to lack of bubbling support for many events, we can't
		 * just listen at the root node. Instead, we have to just
		 * listen to all the nodes that are explicitly bound.
		 * Unlike watchProp(), this method doesn't return an unwatch function.
		 * Use destroy() to release watchers. TODO: think through this later.
		 * @param callback {Function}
		 */
		watchAllProps: function (callback) {
			for (var p in this._options.bindings) {
				this.watchProp(p, callback);
			}
		},

		propChanged: function (newVal, oldVal, name) {
			var node, attr;
			node = this._findNode(name);
			attr = this._getOptionForBinding(name, 'attr');
			setNodeProp(node, attr || name, newVal, !!attr);
		},

		destroy: function () {
			var unwatch;
			while ((unwatch = this._unwatches.pop())) squelchedUnwatch(unwatch);
		},

		_findNode: function (name) {
			var node = this.resolveName(name);
			if (!node) throw new Error('DomAdapter: node not found: ' + name);
			return node;
		},

		_getOptionForBinding: function (name, option) {
			var binding;
			binding = this._options.bindings[name];
			return binding && binding[option] || this._options[option];
		}

	};

	// oh IE, you pile o' wonder
	DomAdapter.destroyAll = function () {
		var unwatch;
		while ((unwatch = allUnwatches.pop())) squelchedUnwatch(unwatch);
	};

	/***** private declarations *****/

	var attrToProp, watchNode, allUnwatches;

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
		"dom-addeventlistener":function () {
			return document && 'addEventListener' in document;
		}
	};

	/**
	 * Returns a property or attribute of a node.
	 * @param node {DOMNode}
	 * @param name {String}
	 * @param options {Object}
	 * @returns the value of the property or attribute
	 */
	function getNodeProp (node, name, useAttr) {
		if (useAttr) {
			return node.getAttribute(name, value);
		}
		else {
			return node[attrToProp[name] || name];
		}
	}

	/**
	 * Sets a property or attribute of a node.
	 * @param node {DOMNode}
	 * @param name {String}
	 * @param value
	 * @param options {Object}
	 * @returns {DOMNode}
	 */
	function setNodeProp (node, name, value, useAttr) {
		if (useAttr) {
			node.setAttribute(name, value);
		}
		else {
			node[attrToProp[name] || name] = value;
		}
		return this;
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

	if (has('dom-addeventlistener')) {
		watchNode = function (node, name, callback) {
			node.addEventListener(name, callback, false);
			return function () {
				node && node.removeEventListener(name, callback, false);
			}
		};
	}
	else {
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
	}

	function squelchedUnwatch (unwatch) {
		try { unwatch(); } catch (ex) {}
	}

	function noop () {}

	function Begetter () {}
	function beget(obj) {
		Begetter.prototype = obj;
		var created = new Begetter();
		Begetter.prototype = undef;
		return created;
	}

	return DomAdapter;

});
