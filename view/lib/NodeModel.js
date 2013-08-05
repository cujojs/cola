/** @license MIT License (c) copyright 2013 original authors */
(function (define) {
define(function (require) {

	var base = require('./base');
	var dom = require('./dom');

	function NodeModel (rootNode, options) {
		var topSection;

		options = Object.create(options);

		if (!options.qsa) options.qsa = dom.qsa;
		if (!options.sectionAttr) options.sectionAttr = base.sectionAttr;

		topSection = this.findSectionNode(rootNode, options) || rootNode;

		this.rootNode = rootNode;
		this.sectionNode = topSection;
		this.binder = options.binder;
		this.options = options;

		this.binding = {
			model: null,
			node: topSection
		};
		// binding = { model, node, push, pull }

	}

	NodeModel.prototype = {

		updateModel: function (model) {
			var curr, p;

			if (!this.binding.model) this.setModel({});
			curr = this.binding.model;

			Object.keys(model).forEach(function (p) {
				curr[p] = model[p];
			});

			this.pushData(this.binding, this.options);
		},

		setModel: function (model) {
			this.clearModel();

			this.binding.model = model;

			this.createAccessors(this.binding, this.options);

			// push model into the dom
			this.pushData(this.binding, this.options);

		},

		/**
		 * Returns the model with updated properties from bound values
		 * from the dom.
		 * @return {Object}
		 */
		getModel: function () {
			if (!this.binding.model) this.binding.model = {};
			if (!this.binding.pull) {
				this.createAccessors(this.binding, this.options);
			}
			this.pullData(this.binding, this.options);
			return this.binding.model;
		},

		clearModel: function () {
			if (this.binding.model) {
				this.binding.model = null;
				this.pushData(this.binding, this.options);
			}
		},

		findModel: function (nodeOrEvent) {
			var binding = this.findBinding(nodeOrEvent);
			return binding && binding.model;
		},

		findNode: function (nodeOrEvent) {
			var binding = this.findBinding(nodeOrEvent);
			return binding && binding.node;
		},

		findBinding: function (nodeOrEvent) {
			var node, binding;
			node = dom.toNode(nodeOrEvent);
			binding = this.binding;
			if (this.containsNode(binding.node, node)) {
				return binding;
			}
			return null;
		},

		findSectionNode: base.findSectionNode,

		binder: base.binder,

		pushData: base.pushData,

		pullData: base.pullData,

		createAccessors: base.createAccessors,

		containsNode: base.containsNode
	};

	return NodeModel;

	function defaultToBlank (val) {
		return val == null ? '' : val;
	}

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));
