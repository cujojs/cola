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
		this.edit = runTransaction;
	}

	Transaction.prototype = {
		map: function(f) {
			var runTransaction = this.edit;
			return new Transaction(function(transactionState) {
				var result = runTransaction(transactionState);
				return [when(result[0], f), result[1]];
			});
		},

		flatMap: function(f) {
			var runTransaction = this.edit;
			return new Transaction(function(transactionState) {
				var result = runTransaction(transactionState);
				var value = when(result[0], f).then(function(transaction) {
					return transaction.edit(result[1])[0];
				});
				return [value, result[1]];
			});
		},

		commit: function(datasource) {
			var result = this.edit(datasource);
			return when.join(when.all(result).spread(commitTransaction), datasource);

			function commitTransaction(data, diff) {
				var changes = diff(data);
				return when(datasource.update(changes)).yield(changes);
			}
		}
	};

	Transaction.begin = function() {
		return new Transaction(function(datasource) {
			var data = datasource.fetch();

			return [data, when(data, datasource.metadata.diff.bind(datasource.metadata))];
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
