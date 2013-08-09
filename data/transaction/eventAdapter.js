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

	return curry(objectEventAdapter);

	function objectEventAdapter(prepareDiff, handler, sources, event) {

		return when.map(sources, getData.bind(void 0, event)).then(
			function(args) {
				var primary = args[0];
				var diff = prepareDiff(primary);

				return when(handler.apply(void 0, args.concat(event)),
					getChanges);

				function getChanges(result) {
					var after = preferResult(primary, result);
					return diff(after);
				}
			}
		);

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

	function getData(e, source) {
		if(typeof source.get === 'function') {
			return source.get(e);
		} else if(typeof source.find === 'function') {
			return source.find(e);
		} else if(typeof source.fetch === 'function') {
			return source.fetch();
		}

		return source;
	}


});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
