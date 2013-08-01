/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author: Brian Cavalier
 * @author: John Hann
 */

(function(define) { 'use strict';
define(function() {


	return function optimistic(notify, changes, tx) {
		if(changes && changes.length) {
			return when(notify(changes), function() {
				return tx.otherwise(function() {
					// TODO: Allow partial changes??
					return notify(rollback(changes));
				});
			});
		}
	};

	function rollback(changes) {
		return changes.reduce(function(inverted, change) {
			if(change.type === 'new') {
				inverted.push({
					type: 'deleted',
					name: change.name,
					object: change.object,
					oldValue: change.object[change.name]
				});
			} else if(change.type === 'deleted') {
				var object = {};
				object[change.name] = change.oldValue;
				inverted.push({
					type: 'new',
					name: change.name,
					object: object
				});
			} else if(change.type === 'updated') {
				var invertedChange = {
					type: 'updated',
					name: change.name,
					object: change.object,
					oldValue: change.object[change.name]
				};

				if('changes' in change) {
					invertedChange.changes = rollback(changes.change);
				}

				inverted.push(invertedChange);
			}

			return inverted;

		}, []);
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));
