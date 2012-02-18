/** MIT License (c) copyright B Cavalier & J Hann */

(function (define, global) {
define(function (require) {
"use strict";

	var makeWatchable = require('./Watchable');

	function makeWatchableDomTree (rootNode) {

		var nameResolver, watchable;

		watchable = makeWatchable({});

		return {

			/**
			 * Injects a function that will resolve a property name
			 * to an object with information about the corresponding node.
			 * @param resolver {Function} function (name) {
			 *     return {
			 *         node: aNode,
			 *         prop: 'aProp',
			 *         attr: 'anAttr', // optional
			 *         events: 'event1,event2' // optional
			 * }
			 */
			setNameResolver: function (resolver) {
				nameResolver = resolver;
			},

			get: function (name) {
				var nodeInfo;
				nodeInfo = resolveNameToNodeInfo(name);
				return getNodeProp(nodeInfo.node, nodeInfo.attr || nodeInfo.prop, !!nodeInfo.attr);
			},

			set: function (name, value) {
				var nodeInfo;
				nodeInfo = resolveNameToNodeInfo(name);
				setNodeProp(nodeInfo.node, nodeInfo.attr || nodeInfo.prop, value, !!nodeInfo.attr);
				watchable.set(name, value);
			},

			watch: function (name, callback) {
				var nodeInfo, unwatchNode, unwatchWatchable;
				nodeInfo = resolveNameToNodeInfo(name);
				unwatchNode = listenToNode(nodeInfo.node, nodeInfo.events, function () {
					var value = getNodeProp(nodeInfo.node, nodeInfo.attr || nodeInfo.prop, !!nodeInfo.attr);
					watchable.set(name, value);
				});
				unwatchWatchable = watchable.watch(name, callback);
				return function () {
					unwatchNode && unwatchNode();
					unwatchWatchable();
				};
			}

		};

		function resolveNameToNodeInfo (name) {
			return nameResolver
				&& nameResolver(name)
				|| guessNode(rootNode, name);
		}

	}

	var attrToProp, watchNode, fireSimpleEvent, allUnwatches;

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
			return document && 'addEventListener' in document || 'addEventListener' in global;
//		},
//		"dom-createevent": function () {
//			return document && 'createEvent' in document;
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

//	if(has('dom-createevent')) {
//		fireSimpleEvent = function (node, type) {
//			// don't bubble since most form events don't anyways
//			var evt = document.createEvent('HTMLEvents');
//			evt.initEvent(type, false, true);
//			node.dispatchEvent(evt);
//		}
//	}
//	else {
//		fireSimpleEvent = function (node, type) {
//			var evt = document.createEventObject();
//			node.fireEvent('on' + type, evt);
//		}
//	}

	function listenToNode (node, events, callback) {

		var unwatchers;

		if (typeof events == 'string') {
			events = events.split(/\s*,\s*/);
		}

//		// add an event for chaining to other participants in the network
//		// of adapters
//		events.push(colaSyntheticEvent);

		if (events && events.lenth > 0) {
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