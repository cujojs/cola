(function (define) {
define(function (require) {

	var cssExtractor = require('../lib/cssExtractor');
	var nodeAccessor = require('../lib/nodeAccessor');

	return bySelectorMap;

	function bySelectorMap (options) {
		var extractor;

		options = Object.create(options || null);

		extractor = cssExtractor(options);

		return function (node) {
			var getters, setters, nodeAttrs;

			getters = [];
			setters = [];
			nodeAttrs = extractor(node);

			nodeAttrs.forEach(function (binding) {
				binding.bind.forEach(function (mapping) {
					var prop, accessor;
					accessor = nodeAccessor(binding.node, mapping[0], mapping[1]);
					if (accessor.set) setters.push(accessor.set);
					if (accessor.get) getters.push(accessor.get);
				});
			});

			return {
				push: function (provider) {
					for (var i = 0; i < setters.length; i++) setters[i](provider);
				},
				pull: function (receiver) {
					for (var i = 0; i < getters.length; i++) getters[i](receiver);
				}
			};
		};
	}

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));
