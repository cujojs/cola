/** MIT License (c) copyright B Cavalier & J Hann */

(function (define) {
define(function () {
"use strict";

	return function mediate (adapter1, adapter2, options) {

		/*
		 Assumes adapter1 and adapter2 have their bindings already.

		 Watch all properties from other adapter and forward change
		 notifications. Stop immediate callbacks and infinite
		 recursion by squelching change notifications while forwarding.
		 */

		var forwarder, unwatch1, unwatch2;

		forwarder = noop;

		function forwardTo (adapter, value, name) {
			pauseForwarding();
			adapter.set(name, value);
			resumeForwarding();
		}

		function pauseForwarding () {
			forwarder = noop;
		}

		function resumeForwarding () {
			forwarder = forwardTo;
		}

		// forward notifications from adapter1 to adapter2
		unwatch1 = adapter1.watchAll(function (value, name) {
			forwarder(adapter2, value, name);
		});

		// forward notifications from adapter2 to adapter1
		unwatch2 = adapter2.watchAll(function (value, name) {
			forwarder(adapter1, value, name);
		});

		// start forwarding
		resumeForwarding();

		if (!options || options.sync !== false) {
			adapter1.forEach(function (value, prop) {
				adapter2.set(prop, value);
			});
		}

		return function unwatch () {
			unwatch1();
			unwatch2();
		};

	};

	function noop () {}

});
}(
	typeof define == 'function'
		? define
		: function (factory) { module.exports = factory(); }
));