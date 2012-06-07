(function (define) {
define(function (require) {
	"use strict";

	var has, classList, formNodeRx, formValueNodeRx,
		attrToProp, customAccessors, setter, getter;

	has = require('./has');
	classList = require('./classList');

	formNodeRx = /^form$/i;
	formValueNodeRx = /^(input|select|textarea)$/i;

	attrToProp = {
		'class': 'className',
		'for': 'htmlFor'
	};

	customAccessors = {
		classList: {
			get: classList.getClassList,
			set: classList.setClassList
		},
		classSet: {
			get: classList.getClassSet,
			set: classList.setClassSet
		}
	};

	getter = setter = initSetGet;

	return {
		isNode: isDomNode,
		isFormValueNode: isFormValueNode,

		nodeByName: guessNode,

		eventsForNode: guessEventsFor,

		propForNode: guessPropFor,
		setNodePropOrAttr: setter,
		getNodePropOrAttr: getter
	};

	/**
	 * Returns true if obj is a Node
	 * @param obj {*}
	 * @return {Boolean}
	 */
	function isDomNode (obj) {
		return (typeof HTMLElement != 'undefined' && obj instanceof HTMLElement)
			|| (obj && obj.tagName && obj.getAttribute);
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
		if (formNodeRx.test(rootNode.tagName)) {
			return rootNode.elements[nodeName];
		}
		// use getElementById, if not a form (yuk!)
		else {
			return rootNode.ownerDocument.getElementById(nodeName);
		}
	}

	function isFormValueNode(node) {
		return formValueNodeRx.test(node.tagName);
	}

	function guessEventsFor (node) {
		if (isFormValueNode(node)) {
			return !has('dom-addeventlistener') && /^(checkbox|radio)/i.test(node.tagName)
				? ['click', 'blur']
				: ['change', 'blur'];
		}

		return null;
	}

	function guessPropFor (node) {
		return isFormValueNode(node) ? 'value' : 'text';
	}

	/**
	 * Returns a property or attribute of a node.
	 * @param node {Node}
	 * @param name {String}
	 * @returns the value of the property or attribute
	 */
	function getNodePropOrAttr (node, name) {
		var accessor, prop;
		accessor = customAccessors[name];
		prop = attrToProp[name] || name;

		if (accessor) {
			return accessor.get(node);
		}
		else if (prop in node) {
			return node[prop];
		}
		else {
			return node.getAttribute(prop);
		}
	}

	/**
	 * Sets a property of a node.
	 * @param node {Node}
	 * @param name {String}
	 * @param value
	 */
	function setNodePropOrAttr (node, name, value) {
		var accessor, prop;
		accessor = customAccessors[name];
		prop = attrToProp[name] || name;

		// this gets around a nasty IE6 bug with <option> elements
		if (node.nodeName == 'option' && prop == 'innerText') {
			prop = 'text';
		}

		if (accessor) {
			return accessor.set(node, value);
		}
		else if (prop in node) {
			node[prop] = value;
		}
		else {
			node.setAttribute(prop, value);
		}

		return value;
	}

	/**
	 * Initializes the dom setter and getter at first invocation.
	 * @private
	 * @param node
	 * @param attr
	 * @param [value]
	 * @return {*}
	 */
	function initSetGet (node, attr, value) {
		// test for innerText/textContent
		attrToProp.textContent
			= ('textContent' in node) ? 'textContent' : 'innerText';
		// continue normally
		setter = setNodePropOrAttr;
		getter = getNodePropOrAttr;
		return arguments.length == 3
			? setNodePropOrAttr(node, attr, value)
			: getNodePropOrAttr(node, attr);
	}

});
}(
	typeof define == 'function'
		? define
		: function (factory) { module.exports = factory(require); }
));