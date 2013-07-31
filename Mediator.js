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

	var when, meld, injectArgument, transaction, queue;

	when = require('when');
	meld = require('meld');
	injectArgument = require('./mediator/injectArgument');
	transaction = require('./data/transaction');
	queue = require('./lib/queue');

	function Mediator(datasource, controller, observer, options) {
		var begintx, pointcut, injector, handleCommit, aspect;

		if(!options) {
			options = {};
		}

		// TODO: Instead of pointcut, accept a capability mapping object
		// TODO: Option for optimistic view update
		injector = options.injector || injectArgument();
		pointcut = options.pointcut || /^[^_]/;

		handleCommit = options.update || optimistic;

		begintx = transaction(options.queue || queue());
		aspect = meld.around(controller, pointcut, transactionAdvice);

		this.destroy = aspect.remove;

		this.refresh = refresh;

		function refresh() {
			return when(datasource.fetch(), function(data) {
				return observer.set(data);
			});
		}

		function notify(changes) {
			return observer.update(changes);
		}

		function transactionAdvice(joinpoint) {
			var state = begintx(datasource);

			return when(state).spread(function(model, commit) {
				var after = injector(model, joinpoint.target, joinpoint.args);

				return when(joinpoint.proceedApply(joinpoint.args), commitTransaction);

				function commitTransaction(result) {
					return commit(after(result)).then(postCommit).yield(result);
				}
			});
		}

		function postCommit(commitResult) {
			return handleCommit(notify, commitResult[0], commitResult[1]);
		}
	}

	Mediator.prototype = {
		destroy: function() {},

		refresh: function() {}
	};

	return Mediator;

//	function pessimistic(datasource, notify, changes, tx) {
//		if(changes && changes.length) {
//			return tx.then(function() {
//				return notify(changes);
//			});
//		}
//	}

	function optimistic(notify, changes, tx) {
		if(changes && changes.length) {
			return when(notify(changes), function() {
				return tx.otherwise(function() {
					// TODO: Allow partial changes??
					return notify(rollback(changes));
				});
			});
		}
	}

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
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
