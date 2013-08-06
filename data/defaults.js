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

	return function(defaults) {
		return function addDefaults(change, model) {
			if(change.type !== 'new') {
				return change;
			}

			return Object.keys(defaults).reduce(function(change, key) {
				var item = change.object[change.name];
				if(!model.has(item, key)) {
					var def = defaults[key];
					model.set(item, key, typeof def === 'function' ? def(item) : def);
				}

				return change;
			}, change);
		}
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));
