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

	var when, meld, createObserver, injectArgument, transactional;

	when = require('when');
	meld = require('meld');
	injectArgument = require('./mediator/injectArgument');
	createObserver = require('./data/observe/changeObserver');
	transactional = require('./data/transactional');

	function Mediator(datasource, controller, options) {
		var observer, updaters, pointcut, injector, aspect;

		if(!options) {
			options = {};
		}

		this.aspects = [];
		this.updaters = updaters = [];
		this.datasource = datasource = transactional(datasource);

		// TODO: Instead of pointcut, accept a capability mapping object
		// TODO: Option for optimistic view update
		injector = options.injector || injectArgument();
		pointcut = options.pointcut || /^[^_]/;

		observer = createObserver(function(data) {
			return datasource.metadata.diff(data);
		}, handleCommit);

		aspect = meld.around(controller, pointcut, transactionAdvice);

		this.aspects.push(aspect);

		function handleCommit(changes, tx) {
			if(changes) {
				return tx.then(function() {
					return datasource.update(changes);
				}).then(function() {
					return notifyAll(changes);
				});
			}
		}

		function notifyAll(changes) {
			return when.map(updaters, function(updater) {
				return updater.update(changes);
			});
		}

		function transactionAdvice(joinpoint) {
			return datasource.transaction(function(model) {
				var after = injector(observer, model,
					joinpoint.target, joinpoint.args);

				return when(joinpoint.proceedApply(joinpoint.args),
					function(result) {
						return [result, after(result)];
					}
				);
			});
		}
	}

	Mediator.prototype = {
		notify: function(view) {
			var updaters = this.updaters;
			// TODO: Make this initial fetch optional
			return when(this.datasource.fetch(), function(data) {
				return view.set(data);
			})
				.then(addView).otherwise(console.error.bind(console));

			function addView(result) {
				updaters.push(view);
				return result;
			}
		},

		destroy: function() {
			this.aspects.forEach(function(aspect) {
				aspect.remove();
			});
		}
	};

	return Mediator;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
