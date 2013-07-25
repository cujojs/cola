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

		return function(observer, model, target, args) {
			var after = observer(model);
			args.unshift(model);
			return function(result) {
				return after.bind(null, choose(model, result));
			};
		};
	};

	function preferResult(model, result) {
		return typeof model === typeof result ? result : model;
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));
