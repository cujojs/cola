/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author: Brian Cavalier
 * @author: John Hann
 */

(function(define) { 'use strict';
define(function() {

	return function createUpdater(handlers) {
		return function update(target, changes, identify) {
			if(!changes) {
				return target;
			}

			return changes.reduce(function(object, change) {
				var handler = handlers[change.type];

				if(handler) {
					handler(object, change.name,
						change.object[change.name], identify);
				}

				return object;
			}, target);
		};
	};

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));
