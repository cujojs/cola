/** @license MIT License (c) copyright 2013 original authors */
(function (define) {
define(function (require) {

	var dom = require('./dom');

	return {

		sectionAttr: 'data-bard-section',

		pushData: function (binding, options) {
			var model, transform, proxy;
			model = binding.model;
			transform = options && options.transform || blankIfNull;
			proxy = this.proxy;
			binding.push(function (key) {
				// get value
				return transform(proxy.get(model, key), key);
			});
		},

		pullData: function (binding, options) {
			var model, proxy;
			model = binding.model;
			proxy = this.proxy;
			binding.pull(function (key, value) {
				// set value, creating hierarchy, if needed
				proxy.set(model, key, value, true);
			});
		},

		createAccessors: function (binding, options) {
			var accessors;
			accessors = this.binder(binding.node);
			binding.push = accessors.push;
			binding.pull = accessors.pull;
			return binding;
		},

		containsNode: function (refNode, testNode) {
			return dom.contains(refNode, testNode);
		},

		findSectionNode: function (rootNode, options) {
			var scope, query;
			scope = options.sectionName;
			query = '[' + options.sectionAttr
				+ (scope ? '="' + scope + '"' : '')
				+ ']';
			return options.qsa(query, rootNode)[0]
				|| options.qsa('ul,ol,tbody,dl', rootNode)[0];
		},

		binder: function () {
			throw new Error('No binder specified.');
//		},
//
//		cloneModel: function (model) {
//			return Object.keys(model).reduce(function (clone, key) {
//				clone[key] = model[key];
//				return clone;
//			}, {});
		}

	};

	function blankIfNull(val) {
		return val == null ? '' : val;
	}

	function noop (val) {
		return val;
	}

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));
