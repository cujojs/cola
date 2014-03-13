/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author Brian Cavalier
 * @author John Hann
 */

(function(define) { 'use strict';
define(function() {

	var tokenRx = /\{\{([^\}]+)\}\}/g;

	return {
		fromString: fromString,
		fromNode: fromNode,
		replaceNode: replaceNode,
		replaceContents: replaceContents
	};

	function fromString(html) {
		return html.replace(tokenRx, function(s, path) {
			return '<span data-path="' + path + '"></span>';
		});
	}

	function fromNode(node) {
		var t = node.cloneNode(true);
		var parent = document.createElement('div');
		parent.appendChild(t);

		parent.innerHTML = fromString(parent.innerHTML);
		return parent.firstElementChild;
	}

	function replaceContents(node) {
		node.innerHTML = fromString(node.innerHTML);
		return node;
	}

	function replaceNode(node) {
		var converted = fromNode(node);
		node.parentNode.replaceChild(converted, node);
		return converted;
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));
