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

	return function domPointer (end, start) {
		var segment, p = '';
		while (start && start !== end && typeof start.getAttribute === 'function') {
			segment = start.getAttribute('name') || start.getAttribute('data-path');
			p = path.join(segment, p);

			if (path.isAbsolute(p)) {
				start = end;
			}
			start = start.parentNode;
		}

		return p;
	}
});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
