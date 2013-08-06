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
	curry = require('../lib/fn').curry;

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
	return curry(function(onUpdate, datasource) {

		var metadata = datasource.metadata;

		return Object.create(datasource, {
			update: { value: update, writable: true, configurable: true  }
		});

		/**
		 * Apply onUpdate transform, then forward changes to datasource
		 * @param {array} changes diff
		 * @returns {*} result of datasource.update
		 */
		function update(changes) {
			return when(mapOnUpdate(changes), datasource.update.bind(datasource));
		}

		function mapOnUpdate(changes) {
			return changes.map(function(change) {
				return onUpdate(change, metadata.model);
			});
		}
	});

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
