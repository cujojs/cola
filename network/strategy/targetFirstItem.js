(function (define) {
define(function () {
"use strict";

	/**
	 * Targets the first item added after a sync.
	 * @param [options] {Object} not currently used.
	 * @return {Function} a network strategy function.
	 */
	return function configure (options) {
		var first = true;

		return function targetFirstItem (source, dest, data, type, api) {
			// check to send "target" event before it gets on the network
			// since sync strategies may squelch network events
			if (dest == api.beforeSending) {
				if (first && 'add' == type) {
					api.queueEvent('target', data);
					first = false;
				}
				else if ('sync' == type) {
					first = true;
				}
			}
		};

	};

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(); }
));