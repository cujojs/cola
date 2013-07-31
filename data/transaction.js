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

	return function(queue) {

		return function begin(datasource) {
			var data, prepared;

			data = datasource.fetch();
			prepared = when(data, function(data) {
				return datasource.metadata.diff(data);
			});

			return [prepared.yield(data), commit];

			function commit(newData) {

				newData = arguments.length > 0 ? newData : data;
				return queue(function() {
					return when(doCommit(newData), function(commitResult) {
						return commitResult[1].then(returnResult, returnResult);

						function returnResult() {
							return commitResult;
						}
					});
				});

				function doCommit(newData) {
					return when.join(prepared, newData).spread(function(diff, newData) {

						var changes, result;

						changes = diff(newData);
						result = when(diff(newData), function(changes) {
							return datasource.update(changes);
						});

						return [changes, result];
					});
				}
			};
		};
	};

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
