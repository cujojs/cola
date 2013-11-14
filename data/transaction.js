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
	rollback = require('./transaction/rollback');
	curry = require('../lib/fn').curry;

	return curry(function(queue, datasource) {

		var cachedData, cachedChanges;

		return Object.create(datasource, {
			fetch:  { value: fetch, writable: true, configurable: true },
			update: { value: update, writable: true, configurable: true },
			commit:   { value: commit, writable: true, configurable: true }
		});

		function fetch(options) {
			if(!cachedData) {
				cachedData = datasource.fetch(options)
			}

			return cachedData;
		}

		function update(changes) {
			if(!cachedData) {
				cachedData = fetch();
			}

			cachedChanges = (cachedChanges||[]).concat(changes);

			return when(cachedData, function(value) {
				return patch(value, changes);
			});
		}

		function patch(data, changes) {
			return datasource.metadata.patch(data, changes);
		}

		function commit(refetch) {
			var changes = cachedChanges;
			cachedChanges = null;

			if(refetch) {
				cachedData = null;
			}

			return queue(function() {
				return when(datasource.update(changes)).otherwise(handleFailure);
			});

			function handleFailure(error) {
				var appliedChanges = error.changes || changes;
				return datasource.update(rollback(appliedChanges))
					.yield(when.reject(changes));
			}
		}
	});

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
