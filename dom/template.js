/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author Brian Cavalier
 * @author John Hann
 */

(function(define) { 'use strict';
define(function(require) {

	var tokenRx = />[^<]*(\{\{([^\}]+)\}\})/g;

	return {
		fromString: fromString,
		fromNode: fromNode
	};

	function fromString(html) {
		return html.replace(tokenRx, function(s, t, path) {
			return s.replace(t, '<span data-path="' + path + '"></span>');
		});
	}

	function fromNode(node) {
		var origParent = node.parentNode;
		var marker = document.createElement('div');
		origParent.replaceChild(marker, node);

		var parent = document.createElement('div');
		parent.appendChild(node);

		parent.innerHTML = fromString(parent.innerHTML);
		node = parent.firstElementChild;
		origParent.replaceChild(node, marker);
		return node;
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
