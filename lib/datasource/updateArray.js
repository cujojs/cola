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

	var handlers, removed;
	
	removed = {};
	handlers = {
		new: function (array, index, item, id) {
			var existing = array[index];
			if (!(existing && id(existing) == id(item))) {
				array[index] = item;
			}
		},
		updated: function (array, index, item) {
			array[index] = item;
		},
		deleted: function (array, index) {
			array[index] = removed;
		}
	};

	return function(id) {
		return function update(array, changes) {
			if(!array) {
				array = [];
			}

			if(!changes) {
				return array;
			}

			// Very naive mark-and-sweep algorithm for removals
			// TODO: coalesce contiguous removal regions
			return changes.reduce(function(array, change) {
				var handler = handlers[change.type];

				if(handler) {
					handler(array, change.name,
						change.object[change.name], id);
				}

				return array;
			}, array)
				.filter(function(item) {
					return item !== removed;
				});
		};
	};

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));
