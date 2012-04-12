(function (define) {
define(function () {

	/**
	 * Returns a strategy function that fires a "sync" function after
	 * an adapter joins the network.  If the adapter has a truthy `sync`
	 * option set, a "sync from" event is fired. Otherwise, a "sync to me"
	 * request is sent.
	 * @param options {Object} not currently used
	 * @return {Function} a network strategy function
	 */
	return function (options) {

		return function syncAfterJoin (source, dest, data, type, api) {
			var options;

			// process this strategy after sending to network
			if ('join' == type && dest == api.afterSending) {
				options = source.getOptions && source.getOptions() || {};
				if (options.sync) {
					// request to sync *from* source (provide)
					api.queueEvent(source, true, 'sync');
				}
				else {
					// request to sync *to* source (consume)
					api.queueEvent(source, false, 'sync');
				}
				// return value doesn't matter
				return false;
			}

		};

	};

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(); }
));