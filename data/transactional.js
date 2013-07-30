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

	var when, queue, txBegin;

	when = require('when');
	queue = require('../lib/queue');
	txBegin = require('./observe/begin');

	/**
	 * Extends a datasource to provide lightweight transactional behavior.
	 * Adds a transaction() method to the datasource to execute a function
	 * on a transacted copy of the data in the datasource.
	 * NOTE: This decorator is idempotent. transactional(transactional(datasource))
	 *  is equivalent to transactional(datasource)
	 * @param {object} datasource datasource to decorate
	 * @param {function?} begin transaction executor function. Transactional
	 *  datasources whose transactions need to be non-overlapping should use
	 *  the same transaction executor.
	 * @returns {object} decorated datasource with additional transaction() API
	 */
	return function transactional(datasource, begin) {
		// If the datasource is already transactional, skip
		if(typeof datasource.transaction === 'function') {
			return datasource;
		}

		if(typeof begin !== 'function') {
			begin = txBegin(queue());
		}

		return Object.create(datasource, {
			transaction: { value: transaction }
		});

		function transaction(run) {
			var self = this;
			return begin(function() {
				return when(self.fetch(), run);
			});
		}
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
