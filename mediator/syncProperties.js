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

		function forwardTo (adapter, name, value) {
			pauseForwarding();
			try {
				return adapter.set(name, value);
			} finally {
				resumeForwarding();
			}
		}

		function pauseForwarding () {
			forwarder = noop;
		}

		function resumeForwarding () {
			forwarder = forwardTo;
		}

		// forward notifications from adapter1 to adapter2
		unwatch1 = adapter1.watchAll(function (name, value) {
			return forwarder(adapter2,name, value);
		});

		// forward notifications from adapter2 to adapter1
		unwatch2 = adapter2.watchAll(function (name, value) {
			return forwarder(adapter1, name, value);
		});

		// start forwarding
		resumeForwarding();

		// TODO: This intitial sync may need to cause other operations to delay
		// until it is complete (which may happen async if secondary is async)
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