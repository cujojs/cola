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

	var updateArray = require('./updateArray');

	return function caching(datasource, options) {
		var cacheInfo, expired, updater;

		if(!options) {
			options = {};
		}

		expired = options.expired || defaultExpired;
		updater = updateArray(datasource.id);

		return Object.create(datasource, {
			fetch: { value: fetch },
			update: { value: update }
		});

		function fetch(options) {
			var now = Date.now();
			if(expired(cacheInfo, now)) {
				cacheInfo = {
					value: datasource.fetch(options),
					created: now
				};
			}

			cacheInfo.accessed = now;
			return cacheInfo.value;
		}

		function update(changes) {
//			var now = Date.now();
//			if(!expired(cacheInfo, now)) {
//				cacheInfo.value = updater(cacheInfo.value, changes);
//				cacheInfo.updated = now;
//
//				if(!cacheInfo.changes) {
//					cacheInfo.changes = changes.slice();
//				} else {
//					cacheInfo.changes = cacheInfo.changes.concat(changes);
//				}
//
//			} else {
				cacheInfo = null;
				return datasource.update(changes);
//			}
		}
	};

	function defaultExpired(cacheInfo) {
		return !(cacheInfo && cacheInfo.value);
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
