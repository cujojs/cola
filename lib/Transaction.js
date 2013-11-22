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

	function Transaction(runTransaction) {
		this.runTransaction = runTransaction;
	}

	Transaction.prototype = {
		map: function(f) {
			var runTransaction = this.runTransaction;
			return new Transaction(function(transactionState) {
				var result = runTransaction(transactionState);
				return [when(result[0], f), result[1]];
			});
		},

		flatMap: function(f) {
			var runTransaction = this.runTransaction;
			return new Transaction(function(transactionState) {
				var result = runTransaction(transactionState);
				var value = when(result[0], f).then(function(transaction) {
					return transaction.runTransaction(result[1])[0];
				});
				return [value, result[1]];
			});
		},

		commit: function(datasource) {
			var result = this.runTransaction(datasource);
			return [when.join(result[0], result[1].diff).spread(function(data, diff) {
				return when(datasource.update(diff(data))).yield(data);
			}), datasource];
		}
	};

	Transaction.begin = function() {
		return new Transaction(function(datasource) {
			var data = datasource.fetch();

			return [data, {
				datasource: datasource,
				diff: when(data, datasource.metadata.diff.bind(datasource.metadata))
			}];
		});
	};

	Transaction.of = function(x) {
		return new Transaction(function(transactionState) {
			return [x, transactionState];
		});
	};

	return Transaction;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
