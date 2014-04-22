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

	var path = require('./path');
	var findIndex = require('./dom').findIndex;

	domPointer.isListNode = isListNode;

	return domPointer;

	function domPointer (end, start) {
		var segment, p = '';
		while (start && start !== end && typeof start.getAttribute === 'function') {
			if(start.parentNode && isListNode(start.parentNode)) {
				segment = String(findIndex(start.parentNode, start));
			} else {
				segment = start.getAttribute('name') || start.getAttribute('data-path');
			}

			p = path.join(segment, p);

			if (path.isAbsolute(p)) {
				start = end;
			}
			start = start.parentNode;
		}

		return p;
	}

	function isListNode (node) {
		return typeof node.hasAttribute === 'function' && node.hasAttribute('data-list');
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
