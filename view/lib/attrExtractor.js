/** @license MIT License (c) copyright 2013 original authors */
(function (define) {
define(function (require) {

	var dom = require('./dom');

	return attrExtractor;

	/**
	 * Returns a function that finds nodes with the given attributes
	 * and returns an array of objects with a node property and a
	 * mappings array of "attr:template" strings.
	 * @param {Object} options
	 * @param {String} options.bindAttr is the attribute on bound nodes.
	 * @param {String} options.sectionAttr is the attribute on section nodes.
	 * @param {Boolean} [options.preserve] should be set to truthy
	 *   to leave the data-bard-bind attrs in the dom after processing
	 *   a node tree.
	 * @param {Function} [options.qsa] is a query selector
	 *   function like jQuery(selector) or dojo.query(selector).  If
	 *   omitted, the browser's querySelectorAll function is used.
	 * @return {Function}
	 */
	function attrExtractor (options) {
		var qsa, bindAttr, sectionAttr, selector, convert;

		qsa = options.qsa || dom.qsa;
		sectionAttr = options.sectionAttr;
		bindAttr = options.bindAttr;
		selector = '[' + sectionAttr + '],[' + bindAttr + ']';

		if (options.preserve) {
			convert = function (node) {
				var b = createBindings(options, node);
				removeBindingAttrs(node);
				return b;
			}
		}
		else {
			convert = createBindings.bind(null, options);
		}

		return function (root) {
			var nodes;

			nodes = Array.prototype.slice.apply(qsa(selector, root));

			// qsa doesn't check the root node
			if (root.getAttribute(bindAttr) != null || root.getAttribute(sectionAttr) != null) {
				nodes.unshift(root);
			}

			return nodes.map(convert);
		};

	}

	// data-bard-bind="attr1:template1;attr2:template2"
	// data-bard-section="name"

	function createBindings (options, node) {
		var binding, bardDef, sectionDef, isTextNode;

		binding = {};
		bardDef = node.getAttribute(options.bindAttr);
		sectionDef = node.getAttribute(options.sectionAttr);

		if (sectionDef) {
			binding.section = sectionDef;
			binding.node = checkRedundantSection(node);
		}
		if (bardDef) {
			binding.node = bardDef.indexOf('text:') >= 0
				? replaceWithTextNode(node)
				: node;
			binding.bind = bardDef.split(';').map(splitPair);
		}
		return binding;
	}

	function removeBindingAttrs (node) {
		node.removeAttribute(bindAttr);
		node.removeAttribute(sectionAttr);
	}

	function splitPair (pair) { return pair.split(':'); }

	function replaceWithTextNode (node) {
		var parent, text;

		// switch element with a text node
		parent = node.parentNode;
		text = node.ownerDocument.createTextNode('');

		parent.insertBefore(text, node);
		parent.removeChild(node);

		return text;
	}

	/**
	 * TODO: this feels hacky. we should fix this in the parse step, imho.
	 *
	 * Removes a data-bard-section node if it has no siblings.  It returns
	 * the node's parent instead.  Rationale: a data-bard-section node
	 * as an only child probably means that the dev intended the parent
	 * to be the section root, but there is no way to indicate that with
	 * mustache-style template tags.
	 * @private
	 * @param {HTMLElement} sectionNode
	 * @return {HTMLElement} parent or sectionNode
	 */
	function checkRedundantSection (sectionNode) {
		var parent, node, type;

		parent = sectionNode.parentNode;

		if (parent) {
			node = parent.firstChild;
			while (node) {
				type = node.nodeType;
				// if there is a peer element
				if (type == 1) return sectionNode;
				// if this is a non-blank text node
				else if (type == 3) {
					if (!/\S+/.test(node.data)) return sectionNode;
				}
				node = node.nextSibling;
			}
		}

		parent.removeChild(sectionNode);

		return parent;
	}

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));
