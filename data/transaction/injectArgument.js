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

	return function injectArg(choose) {
		if(typeof choose !== 'function') {
			choose = preferResult;
		}

		return function(model, target, args) {
			args.unshift(model);
			return function(result) {
				return choose(model, result);
			};
		};
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
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));
