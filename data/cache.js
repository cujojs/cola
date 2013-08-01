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

	/**
	 * Decorates a datasource with *simple* write-through caching behavior.
	 * Adds a sync() method to the datasource to flush the cache such a
	 * subsequent fetch() will fetch fresh data from the underlying datasource.
	 * NOTE: This is primarily intended to avoid fetch()ing unnecessarily, and not
	 * as a large scale caching solution.
	 * @param {object} datasource datasource to decorate
	 * @returns {object} decorated datasource with additional sync() API
	 */
	return function cache(datasource) {
		var cached;

		return Object.create(datasource, {
			fetch:  { value: fetch, writable: true, configurable: true },
			update: { value: update, writable: true, configurable: true },
			sync:   { value: sync, writable: true, configurable: true }
		});

		function fetch(options) {
			if(!cached) {
				cached = datasource.fetch(options)
			}

			return cached;
		}

		function update(changes) {
			if(!cached) {
				cached = fetch();
			}

			return when(cached, function(value) {
				return patch(value, changes);
			}).then(function() {
				return datasource.update(changes);
			});
		}

		function patch(data, changes) {
			return datasource.metadata.patch(data, changes);
		}

		function sync() {
			cached = null;
		}
	};

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
