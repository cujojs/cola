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

	return curry(objectPropertyAdapter);

	function objectPropertyAdapter(dispatcher, prepareDiff, property, target, change) {

		var container, item, diff;

		container = change.object;
		item = container[change.name];
		diff = prepareDiff(container);

		target[property] = container;
		return when(dispatcher(target, change.type, [item, change]), function() {
			return diff(target[property]);
		});
	};

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
