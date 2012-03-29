/** MIT License (c) copyright B Cavalier & J Hann */

(function (define) {
define(function () {

	function noop() {}

	/**
	 * Returns a view of the supplied collection adapter, such that the view
	 * appears to contain transformed items, and delegates to the supplied
	 * adapter.  If an inverse transform is supplied, either via the
	 * inverse param, or via transform.inverse, it will be used when items
	 * are added or removed
	 * @param adapter {Object} the adapter for which to create a transformed view
	 * @param transform {Function} the transform to apply to items
	 * @param [inverse] {Function}
	 */
	function transformCollection(adapter, transform, inverse) {

		if(!transform) throw new Error('No transform supplied');

		inverse = inverse || transform.inverse;

		return {
			comparator: adapter.comparator,
			identifier: adapter.identifier,

			forEach: function(lambda) {
				function transformedLambda(item) {
					return lambda(transform(item));
				}

				return adapter.forEach(transformedLambda);
			},

			watch: function(added, removed) {
				return adapter.watch(
					function(item) {
						return added(transform(item));
					},
					function(item) {
						return removed(transform(item));
					}
				);
			},

			// If no inverse is supplied, we can't transform the
			// value back
			add: inverse
				? function(item) {
					return adapter.add(inverse(item));
				}
				: noop,

			remove: inverse
				? function(item) {
					return adapter.remove(inverse(item));
				}
				: noop,

			getOptions: function() {
				return adapter.getOptions();
			}
		}

	}

	return transformCollection;

});
}(
	typeof define == 'function'
		? define
		: function (factory) { module.exports = factory(); }
));