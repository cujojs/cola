/** MIT License (c) copyright B Cavalier & J Hann */

(function (define) {
define(function () {
"use strict";

	return {

		connectObjects: function (adapter1, adapter2) {

			/*
			 Assumes adapter1 and adapter2 have their bindings already.

			 Watch all properties from other adapter and forward change
			 notifications. Stop immediate callbacks and infinite
			 recursion by squelching change notifications while forwarding.
			 */

			var forwarder = noop;

			function forwardTo (adapter, value, name) {
				pauseForwarding();
				adapter.propChanged(value, name);
				resumeForwarding();
			}

			function pauseForwarding () {
				forwarder = noop;
			}

			function resumeForwarding () {
				forwarder = forwardTo;
			}

			// forward notifications from adapter1 to adapter2
			adapter1.watchAllProps(function (value, name) {
				forwarder(adapter2, value, name);
			});

			// forward notifications from adapter2 to adapter1
			adapter2.watchAllProps(function (value, name) {
				forwarder(adapter1, value, name);
			});

			// start forwarding
			resumeForwarding();

		}

	};

	function noop () {}

});
}(
	typeof define == 'function'
		? define
		: function (factory) { module.exports = factory(); }
));