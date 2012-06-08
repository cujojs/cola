(function (define) {
define(function (require) {
"use strict";

	var slice, guess;

	slice = Array.prototype.slice;
	guess = require('./guess');

	/*
	TODO: inverse bind handler:
	1. create "on!" wire reference resolver
	2. look for inverse property in spec that acts as an each.inverse
	3. look for inverse on "each" handler
	4. provide an inverse function for our defaultNodeHandler
	5. use guess.js to guess events
	 */

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

		nodeFinder = options.nodeFinder || options.querySelectorAll || options.querySelector;

		if(!nodeFinder) throw new Error('bindingHandler: options.nodeFinder must be provided');

		return function createBindingHandler (binding, prop) {

			var bindingsAsArray = normalizeBinding(binding);

			return function handler (item) {

				bindingsAsArray.forEach(function(binding) {
					var each, all, info, nodes;

					each = binding.each || binding.handler || defaultNodeHandler;
					all = binding.all;
					info = Object.create(binding);
					if (!info.prop) info.prop = prop;

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

				});

			};
		};

	};

	function normalizeBinding(binding) {
		var normalized;

		if(typeof binding == 'string') {
			normalized = [{ selector: binding }];
		} else if(Array.isArray(binding)) {
			normalized = binding;
		} else {
			normalized = [binding];
		}

		return normalized;
	}

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