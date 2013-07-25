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

	var when, meld, id, createObserver, injectArgument,
		diffArray, diffObject, transactional;

	when = require('when');
	meld = require('meld');
	id = require('./lib/id');
	injectArgument = require('./mediator/injectArgument');
	createObserver = require('./data/observe/changeObserver');
	diffArray = require('./data/diff/array');
	diffObject = require('./data/diff/object');
	transactional = require('./data/transactional');

	function Mediator(datasource, controller, options) {
		var observer, diff, updaters, pointcut, injector, aspect;

		if(!options) {
			options = {};
		}

		this.aspects = [];
		this.updaters = updaters = [];
		this.datasource = datasource = transactional(datasource);

		// TODO: Instead of pointcut, accept a capability mapping object
		// TODO: New name for datasource.id function
		// TODO: Option for optimistic view update
		diff = options.diff || diffArray(id(datasource.id), diffObject);
		injector = options.injector || injectArg();
		pointcut = options.pointcut || /^[^_]/;

		observer = createObserver(diff, handleCommit);

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
			return datasource.begin(function(model) {
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
			return when(this.datasource.fetch(), view.set.bind(view))
				.then(addView);

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
