/** MIT License (c) copyright B Cavalier & J Hann */

(function (define) {
define(function () {

	function transformedCollection(adapter, transform) {
		var inverse;

		if(!transform) throw new Error('No transform supplied');

		inverse = transform.inverse || function() {
			throw new Error("No inverse transform provided, cannot add or remove");
		};

		return {
			comparator: adapter.comparator,
			symbolizer: adapter.symbolizer,

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

			add: function(item) {
				return adapter.add(inverse(item));
			},

			remove: function(item) {
				return adapter.remove(inverse(item));
			},

			getOptions: function() {
				return adapter.getOptions();
			}
		}

	}

	return transformedCollection;

});
}(
	typeof define == 'function'
		? define
		: function (factory) { module.exports = factory(); }
));