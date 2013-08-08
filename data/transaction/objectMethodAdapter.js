/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author: Brian Cavalier
 * @author: John Hann
 */

(function(define) { 'use strict';
define(function(require) {

	var when, curry;

	when = require('when');
	curry = require('../../lib/fn').curry;

	return curry(objectMethodAdapter);

	function objectMethodAdapter(dispatcher, prepareDiff, target, change) {

		var container, item, diff;

		container = change.object;
		item = container[item];
		diff = prepareDiff(container);

		return when(dispatcher(target, change.type, [container, item, change]),
			getChanges);

		function getChanges(result) {
			var after = preferResult(container, result);
			return diff(after);
		}
	};

	function preferResult(model, result) {
		var shouldPreferResult;

		if(model === Object(model) && typeof model.constructor === 'function') {
			shouldPreferResult = result instanceof model.constructor;
		} else {
			shouldPreferResult = typeof result === typeof model;
		}

		return shouldPreferResult ? result : model;
	}


});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
