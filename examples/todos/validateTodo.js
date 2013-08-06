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

	return function validateTodo(change, metadata) {
		var todo, description;
		if(change.type === 'new' || change.type === 'updated') {
			todo = change.object[change.name];
			description = metadata.model.get(todo, 'description');

			if(!(description && description.trim().length)) {
				throw new Error('todo description required');
			}
		}
	};

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));
