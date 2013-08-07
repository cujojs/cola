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

	var when, rollback, curry;

	when = require('when');
	rollback = require('./rollback');
	curry = require('../../lib/fn').curry;

	return curry(function(updatable, transaction) {

		return Object.create(transaction, {
			update: { value: update, writable: true, configurable: true },
			commit:   { value: commit, writable: true, configurable: true }
		});

		function update(changes) {
			return when(transaction.update(changes), function(result) {
				return when(updatable.update(changes)).yield(result);
			});
		}

		function commit() {
			return transaction.commit().otherwise(function(changes) {
				return when(updatable.update(rollback(changes))).yield(changes);
			})
		}
	});

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
