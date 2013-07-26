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

	var when = require('when');

	return function caching(datasource, options) {
		var cacheInfo;

		if(!options) {
			options = {};
		}

		return Object.create(datasource, {
			fetch: { value: fetch },
			update: { value: update },
			sync: { value: sync }
		});

		function fetch(options) {
			if(!cacheInfo) {
				cacheInfo = {
					value: datasource.fetch(options)
				};
			}

			return cacheInfo.value;
		}

		function update(changes) {
			if(!cacheInfo) {
				cacheInfo = {};
			}

			cacheInfo.value = when(cacheInfo.value, function(value) {
				return patch(value, changes);
			});

			if(!cacheInfo.changes) {
				cacheInfo.changes = changes.slice();
			} else {
				cacheInfo.changes = cacheInfo.changes.concat(changes);
			}

			return cacheInfo.value;
		}

		function patch(data, changes) {
			return datasource.metadata.patch(data, changes);
		}

		function sync(forceRefetch) {
			if(cacheInfo) {
				var result = datasource.update(cacheInfo.changes.slice());

				if(forceRefetch) {
					cacheInfo = null;
				} else {
					cacheInfo.changes = null;
				}

				return result;
			}
		}
	};

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
