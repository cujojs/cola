(function (define) {
define(function (require) {
	"use strict";

	var when, undef;

	when = require('when');

	function noop() {}

	/**
	 * Promise aware implementation of the callbacks/signal pattern.
	 */
	function Notifier() {
		this._listeners = {};
	}

	Notifier.prototype = {
		/**
		 * Add a listener for a particular signal
		 * @param signal {String} name of the signal
		 * @param handler {Function} function to invoke when the signal is emitted
		 *
		 * @return {Function} a function to remove (unlisten) this particular handler
		 * from the supplied signal
		 */
		listen: function(signal, handler) {
			if(typeof handler != 'function') return noop;

			var listeners = this._listeners;

			listeners = listeners[signal] || (listeners[signal] = []);

			listeners.push(handler);

			return function() {
				removeFromArray(listeners, handler);
			}
		},

		/**
		 * Notify all handlers registered for the supplied signal, and pass to them
		 * any additional parameters
		 *
		 * @param signal {String} name of the signal to notify
		 *
		 * @return a promise that will complete once all handlers have been
		 *  invoked **and** all promises returned by them have completed.
		 */
		notify: function(signal) {
			var listeners, args;

			listeners = this._listeners[signal];

			args = Array.prototype.slice.call(arguments, 1);

			return listeners && listeners.length
				? notify(listeners, args)
				: args;
		},

		/**
		 * Notify all handlers for a set of signals, and pass to them any additional
		 * parameters
		 *
		 * @param signals {Array} array of String signal names to notify
		 *
		 * @return a promise that will complete once all handlers have been
		 *  invoked **and** all promises returned by them have completed.
		 */
		notifyAll: function(signals) {
			var listeners, args;

			listeners = this._listeners;
			args = Array.prototype.slice.call(arguments, 1);

			// Could potentially merge the two signal handler arrays, then notify,
			// instead of notifying each array independently.  It's not clear
			// which behavior is correct.

			return when.reduce(signals, function(args, signal) {
				var l = listeners[signal];
				return l && l.length
					? notify(l, args)
					: args;
			}, args);
		}

	};

	return Notifier;

	function notify(listeners, args) {
		return when.reduce(listeners, function(args, handler) {
			return when(handler.apply(undef, args), function() {
				return args;
			});

		}, args);
	}

	function removeFromArray(arr, item) {
		var i = arr.length - 1;

		for(; i >= 0; --i) {
			if(arr[i] === item) {
				arr.splice(i, 1);
				return;
			}
		}
	}

});
}(
	typeof define == 'function'
		? define
		: function (factory) { module.exports = factory(require); }
));