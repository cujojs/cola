(function (define) {
define(function () {

	/**
	 * Creates a base strategy function.  If no earlier strategy cancels
	 * the event, this strategy will apply it to the destination adapter.
	 * @param options {Object} not currently used
	 * @return {Function} a network strategy function
	 */
	return function (options) {

		return function baseStrategy (source, dest, data, type, api) {
			// `type in dest` will implicitly fall through if dest is one
			// of the meta-adapters (beforeSending, afterSending, etc.)
			if (type in dest && source != dest) {
				if (typeof dest[type] != 'function') {
					throw new Error('baseStrategy: ' + type + ' is not a function.');
				}
				dest[type](data);
			}
		};

	};

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(); }
));