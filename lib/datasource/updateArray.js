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
			if(!changes) {
				return array;
			}

			// This is a very naive mark-and-sweep algorithm
			// to track
			var marked = changes.reduce(function(array, change) {
				var handler = handlers[change.type];

				if(handler) {
					handler(array, change.name, change.object[change.name], id);
				}

				return array;
			}, array);

			return marked.reduce(function(results, item) {
				if(item !== removed) {
					results.push(item);
				}

				return results;
			}, []);
		};
	};

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));
