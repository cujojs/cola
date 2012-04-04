/** MIT License (c) copyright B Cavalier & J Hann */

(function (define) {
define(function (require) {

	var when;

	when = require('when');

	/**
	 * Returns a view of the supplied collection adapter, such that the view
	 * appears to contain transformed items, and delegates to the supplied
	 * adapter.  If an inverse transform is supplied, either via the
	 * inverse param, or via transform.inverse, it will be used when items
	 * are added or removed
	 * @param adapter {Object} the adapter for which to create a transformed view
	 * @param transform {Function} the transform to apply to items. It may return
	 *  a promise
	 * @param [inverse] {Function} inverse transform, can be provided explicitly
	 *  if transform doesn't have an inverse property (transform.inverse). It may
	 *  return a promise
	 */
	function transformCollection(adapter, transform, inverse) {

		if(!transform) throw new Error('No transform supplied');

		inverse = inverse || transform.inverse;

		return {
			comparator: adapter.comparator,
			identifier: adapter.identifier,

			forEach: function(lambda) {
				var inflight;

				function transformedLambda(item) {

					inflight = when(inflight, function() {
						return when(transform(item), lambda);
					});

					return inflight;
				}

				return when(adapter.forEach(transformedLambda), function() {
					return inflight;
				});
			},

			watch: function(added, removed) {
				return adapter.watch(
					function(item) {
						return when(transform(item), added);
					},
					function(item) {
						return when(transform(item), removed);
					}
				);
			},

			// If no inverse is supplied, we can't transform the
			// value back
			add: inverse
				? function(item) {
					return when(inverse(item), function(transformed) {
						return adapter.add(transformed);
					});
				}
				: noop,

			remove: inverse
				? function(item) {
					return when(inverse(item), function(transformed) {
						return adapter.remove(transformed);
					});
				}
				: noop,

			getOptions: function() {
				return adapter.getOptions();
			}
		}

	}

	return transformCollection;

	function noop() {}

});
}(
	typeof define == 'function'
		? define
		: function (factory) { module.exports = factory(require); }
));