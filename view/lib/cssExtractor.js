(function (define) {
define(function (require) {

	var dom = require('./dom');

	return cssExtractor;

	/**
	 * Returns a function that finds nodes by css selectors specified in a
	 * map of data attributes to css selectors.  The shape of this map follows
	 * early versions of cola:
	 * {
	 *   lastname: { selector: '.lastname', prop: 'value' },
	 *   firstname: [
	 *     { selector: '.firstname', prop: 'value' },
	 *     { selector: '.greeting', prop: 'textContent' },
	 *   ]
	 *   foo: 'input.foo' // guess property
	 * }
	 * @param {Object} options
	 * @param {Object} options.bindings
	 * @param {Function} [options.qsa] is a query selector
	 *   function like jQuery(selector) or dojo.query(selector).  If
	 *   omitted, the browser's querySelectorAll function is used.
	 * @returns {Function}
	 */
	function cssExtractor (options) {
		var qsa, mappings;

		qsa = options.qsa || dom.qsa;
		mappings = Object.keys(options.bindings).reduce(function (mappings, key) {
			return mappings.concat(normalizeMapping(options.bindings[key], key));
		}, []);

		return function (root) {
			// return objects with node, bind, and section(???) properties
			return mappings.reduce(function (bindings, mapping) {
				var nodes = Array.prototype.slice.call(qsa(mapping.selector, root));
				return bindings.concat(nodes.map(function (node) {
					return {
						node: node,
						bind: [
							[
								mapping.prop || dom.guessProp(node),
								mapping.key
							]
						]
					};
				}));
			}, []);
		};
	}

	function normalizeMapping (mapping, key) {
		return [].concat(mapping).map(function (binding) {
			var norm;

			if (typeof binding == 'string') {
				norm = { selector: binding };
			}
			else {
				norm = Object.create(binding);
			}
			if (!norm.key) norm.key = key;

			return norm;
		});
	}

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));
