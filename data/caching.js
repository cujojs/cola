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

	var when, updateArray;

	updateArray = require('./update/updateArray');
	when = require('when');

	return function caching(datasource, options) {
		var cacheInfo, updater;

		if(!options) {
			options = {};
		}

		updater = options.updater || updateArray(datasource.id);

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
				return updater(value, changes, datasource.id);
			});

			if(!cacheInfo.changes) {
				cacheInfo.changes = changes.slice();
			} else {
				cacheInfo.changes = cacheInfo.changes.concat(changes);
			}

			return cacheInfo.value;
		}

		function sync() {
			if(cacheInfo) {
				var result = datasource.update(cacheInfo.changes);
				cacheInfo = null;

				return result;
			}
		}
	};

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
