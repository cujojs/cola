(function (define) {
define(function (require) {
"use strict";

	var slice, guess;

	slice = Array.prototype.slice;
	guess = require('./guess');

	/*
	bind: {
		to: { $ref: 'colaThing' },
		map: {
			prop1: [
				{ selector: 'input.my' , attr: 'value' },
				{ selector: 'a selector', handler: { $ref: 'someFunction' } },
				{ selector: '.selector', attr: 'text', handler: { $ref: 'aNodeHandlerFunction' } }
				{
					selector: '.many',
					attr: 'text',
					each: { $ref: 'aNodeHandlerFunction' },
					all: { $ref: 'aNodeListHandlerFunction' }
				}
			]
		}
	}

	function aNodeHandlerFunction (node, data, info, doDefault) {
		var selector, attr, data, prop;
		selector = info.selector;
		attr = info.attr;
		prop = info.prop;
		doDefault(node, info);
	}

	function aNodeListHandlerFunction (nodes, data, info, doDefault) {
		var selector, attr, data, prop;
		selector = info.selector;
		attr = info.attr;
		prop = info.prop;
		nodes.forEach(function (node) {
			doDefault(node, info);
		});
	}

	*/

	/**
	 *
	 * @param rootNode {HTMLElement} the node at which to base the
	 *   nodeFinder searches
	 * @param options {Object}
	 * @param options.nodeFinder {Function} querySelector, querySelectorAll, or
	 *   another function that returns HTML elements given a string and a DOM
	 *   node to search from: function (string, root) { return nodeOrList; }
	 * @return {Function} the returned function creates a binding handler
	 *   for a given binding. it is assumed that the binding has been
	 *   normalized. function (binding, prop) { return handler; }
	 */
	return function configureHandlerCreator (rootNode, options) {
		var nodeFinder;
		nodeFinder = options.nodeFinder;

		return function createBindingHandler (binding, prop) {
			var each, all, info;

			each = binding.each || binding.handler || defaultNodeHandler;
			all = binding.all;
			info = Object.create(binding);
			if (!info.prop) info.prop = prop;

			return function handler (item) {
				var nodes;

				// get all affected nodes
				if (!binding.selector) {
					nodes = [rootNode];
				}
				else {
					nodes = toArray(nodeFinder(binding.selector, rootNode));
				}

				// run handler for entire nodelist, if any
				if (all) all(nodes, item, info, defaultNodeListHandler);

				// run custom or default handler for each node
				nodes.forEach(function (node) {
					each(node, item, info, defaultNodeHandler);
				});

			};
		};

	};

	function defaultNodeListHandler (nodes, data, info) {
		nodes.forEach(function (node) {
			defaultNodeHandler(node, data, info);
		})
	}

	function defaultNodeHandler (node, data, info) {
		var attr, value, current;
		attr = info.attr || guess.propForNode(node);
		value = data[info.prop];
		// always compare first to try to prevent unnecessary IE reflow/repaint
		current = guess.getNodePropOrAttr(node, attr);
		if (current !== value) {
			guess.setNodePropOrAttr(node, attr, value);
		}
	}

	function toArray (any) {
		if (!any) return []; // nothin
		else if (Array.isArray(any)) return any; // array
		else if (any.length) return slice.call(any); // nodelist
		else return [any]; // single node
	}

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (deps, factory) { module.exports = factory(require); }
));