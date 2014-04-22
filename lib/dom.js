/** @license MIT License (c) copyright 2013 original authors */
(function (define) {
define(function () {

	var containsImpl = getContainsImpl;

	var formTypes = { 'INPUT': 1, 'SELECT': 1, 'TEXTAREA': 1 };
	var formClickables = { 'CHECKBOX': 1, 'RADIO': 1 };

	/**
	 * Reused dom helper functions.
	 * @type {Object}
	 */
	var dom = {

		/**
		 * Returns true if refNode contains testNode in its hierarchy.
		 * @param {Node} refNode
		 * @param {Node} testNode
		 * @return {Boolean}
		 */
		contains: function (refNode, testNode) {
			return containsImpl(refNode, testNode);
		},

		/**
		 * Test if nodeOrEvent is a node or an event.  If it's an event, it
		 * returns the event's target. Otherwise, it returns the node.
		 * @param {Node|Event} nodeOrEvent
		 * @return {Node}
		 */
		toNode: function (nodeOrEvent) {
			var node;
			node = 'nodeName' in nodeOrEvent && 'nodeType' in nodeOrEvent
				? nodeOrEvent
				: nodeOrEvent.target || nodeOrEvent.srcElement;
			return node;
		},

		qsa: function (selector, node) {
			return node.querySelectorAll(selector);
		},

		findIndex: findIndex,
		insertAt: insertAt,
		guessProp: guessPropFor,
		setValue: setValue,
		getValue: getValue

	};

	return dom;

	function insertAt(parent, i, child) {
		var children = parent.children;
		if(i >= children.length) {
			return parent.appendChild(child);
		}

		return parent.insertBefore(child, parent.children[i]);
	}

	function findIndex(container, node) {
		var children = container.children;
		for(var i=0; i<children.length; ++i) {
			if(node === children[i]) {
				return i;
			}
		}

		throw new Error('node not in container');
	}

	/**
	 * Determines the DOM method used to compare the relative positions
	 * of DOM nodes and returns an abstraction function.
	 * @private
	 * @return {Function} function (refNode, testNode) { return boolean; }
	 */
	function getContainsImpl () {
		if (typeof document != 'undefined' && document.compareDocumentPosition) {
			// modern browser
			containsImpl = function (refNode, testNode) {
				return (refNode.compareDocumentPosition(testNode) & 16) == 16;
			};
		}
		else {
			// assume legacy IE
			containsImpl = function (refNode, testNode) {
				return refNode.contains(testNode);
			};
		}
		return containsImpl.apply(null, arguments);
	}

	function isFormValueNode (node) {
		return node.nodeName && node.nodeName.toUpperCase() in formTypes;
	}

	function isClickableFormNode (node) {
		return isFormValueNode(node)
			&& node.type && node.type.toUpperCase() in formClickables;
	}

	function guessPropFor (node) {
		return isFormValueNode(node)
			? isClickableFormNode(node) ? 'checked' : 'value'
			: 'textContent';
	}

	function setValue(node, value) {
		node[guessPropFor(node)] = value;
	}

	function getValue(node) {
		return node[guessPropFor(node)];
	}

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(); }
));
