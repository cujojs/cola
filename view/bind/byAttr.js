(function (define) {
define(function (require) {

	var extractDomAttrs = require('../lib/attrExtractor');
	var nodeAccessor = require('../lib/nodeAccessor');

	var bindAttr = 'data-bard-bind';
	var sectionAttr = 'data-bard-section';

	return byAttr;

	function byAttr (options) {
		var extractor;

		options = Object.create(options || null);
		if (!options.sectionAttr) options.sectionAttr = sectionAttr;
		if (!options.bindAttr) options.bindAttr = bindAttr;

		extractor = extractDomAttrs(options);

		return function (node) {
			var getters, setters, nodeAttrs;

			getters = [];
			setters = [];
			nodeAttrs = extractor(node);

			nodeAttrs.forEach(function (binding) {
				if (!binding.bind) return;
				binding.bind.forEach(function (mapping) {
					var accessor;
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
		}
	}

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));
