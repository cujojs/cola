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

	var when, meld, transaction, injectArgument, pessimistic, queue;

	when = require('when');
	meld = require('meld');
	transaction = require('./data/transaction');
	injectArgument = require('./data/mediator/injectArgument');
	pessimistic = require('./data/mediator/pessimisticObserver');
	queue = require('./lib/queue');

	return function mediate(datasource, controller, observer, options) {
		var begintx, pointcut, injector, observe, aspect;

		if(!options) {
			options = {};
		}

		// TODO: Instead of pointcut, accept a capability mapping object
		// TODO: Option for optimistic view update
		injector = options.injector || injectArgument();
		pointcut = options.pointcut || /^[^_]/;

		observe = options.observe || pessimistic;

		begintx = transaction(options.queue || queue());
		aspect = meld.around(controller, pointcut, transactionAdvice);

		return {
			destroy: aspect.remove,
			refresh: refresh
		};

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
					// FIXME: This propagates errors, but throws away the
					// success result from postCommit. Not sure if we need it
					return commit(after(result)).then(postCommit).yield(result);
				}
			});
		}

		function postCommit(commitResult) {
			return observe(notify, commitResult[0], commitResult[1]);
		}
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
