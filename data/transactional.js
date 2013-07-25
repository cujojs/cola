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

	return function transactional(datasource, begin) {
		if(typeof datasource.begin === 'function') {
			return datasource;
		}

		if(typeof begin !== 'function') {
			begin = txBegin(queue());
		}

		return Object.create(datasource, {
			begin: {
				value: transaction
			}
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
