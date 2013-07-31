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
	 * Decorates a datasource by applying transformations to data that
	 * is retrieved via fetch() and saved via update().
	 * @param {object} datasource datasource to decorate
	 * @param {function} onFetch transform to apply to data
	 *  returned by datasource.fetch
	 * @param {function} onUpdate transform to apply to changes
	 *  passed to datasource.update
	 * @returns {object} decorated datasource
	 */
	return function transforming(datasource, onFetch, onUpdate) {

		return Object.create(datasource, {
			fetch:  { value: fetch },
			update: { value: update }
		});

		/**
		 * Fetch data from datasource and apply onFetch transform
		 * @returns {*} transformed data from datasource
		 */
		function fetch() {
			return when(datasource.fetch.apply(this, arguments), onFetch);
		}

		/**
		 * Apply onUpdate transform, then forward changes to datasource
		 * @param {array} changes diff
		 * @returns {*} result of datasource.update
		 */
		function update(changes) {
			return when(onUpdate(changes), datasource.update.bind(this));
		}
	};

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
