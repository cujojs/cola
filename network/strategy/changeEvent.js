(function (define) {
define(function () {
	"use strict";

	var triggeringEventTypes = {
		add: 1,
		update: 1,
		sync: 1
	};

	/**
	 * Trigger a change event as a result of other events.
	 * @return {Function} a network strategy function.
	 */
	return function configure () {

		return function queueChange (source, dest, data, type, api) {
			if (api.isAfter() && triggeringEventTypes[type]) {
				api.queueEvent(source, type, 'change');
			}
		};

	};

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(); }
));