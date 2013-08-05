/** @license MIT License (c) copyright 2013 original authors */
(function (define) {
define(function (require) {

	var simpleTemplate = require('./simpleTemplate');

	return nodeAccessor;

	/**
	 * Returns a setter and a getter for a given node and attribute.
	 * `key` is a unique value that is sent to the getter and setter.
	 * It may also be a simple template (using {{token}} tags) to combine
	 * several data elements into one string.
	 * @param {HTMLElement} node
	 * @param {String} attr
	 * @param {String} key
	 * @returns {{set: Function, get: Function}}
	 */
	function nodeAccessor (node, attr, key) {
		var compiled, setter, getter;

		compiled = simpleTemplate.compile(key);
		if (compiled.length > 1) {
			setter = createTemplateUpdater(node, attr, compiled);
		}
		else {
			// key is a literal if the {{}} wrapper was omitted
			key = compiled[0].key || compiled[0].literal;
			setter = createSetter(node, attr, key);
			getter = createGetter(node, attr, key);
		}
		return { set: setter, get: getter };
	}

	function createTemplateUpdater (node, attr, compiled) {
		var setter = createSetter(node, attr);
		return function (provider) {
			var content = simpleTemplate.exec(compiled, provider);
			setter(function () { return content; });
		};
	}

	function createSetter (node, attr, key) {
		if ('(empty)' == attr) return createEmptySetter(node, key);
		if ('text' == attr) attr = 'data';
		else if ('html' == attr) attr = 'innerHTML';
		return attr in node
			? function (provider) {
				var newVal = provider(key), oldVal = node[attr];
				if (newVal != oldVal) node[attr] = newVal;
			}
			: function (provider) {
				var newVal = provider(key), oldVal = node.getAttribute(attr);
				if (newVal != oldVal) node.setAttribute(attr, newVal);
			}
	}

	function createGetter (node, attr, key) {
		if ('(empty)' == attr) return createEmptyGetter(node, key);
		if ('text' == attr) attr = 'data';
		else if ('html' == attr) attr = 'innerHTML';
		return attr in node
			? function (receiver) { receiver(key, node[attr]); }
			: function (receiver) { receiver(key, node.getAttribute(attr)); }
	}

	function createEmptySetter (node, key) {
		return function (provider) {
			if (provider(key)) {
				node.setAttribute(key, key);
			}
			else {
				node.removeAttribute(key);
			}
		};
	}

	function createEmptyGetter (node, key) {
		return function (receiver) {
			// Note: there may be IE6-8 issues lurking here:
			receiver(key, node.hasAttribute(key));
		};
	}

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));
