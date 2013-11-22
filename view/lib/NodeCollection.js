/** @license MIT License (c) copyright 2013 original authors */
(function (define) {
define(function (require) {

	var base = require('./base');
	var dom = require('./dom');
	var search = require('./search');
	var most = require('most');

	/**
	 * Binds a dom node to data.
	 * @constructor
	 * @param {HTMLElement} rootNode
	 * @param {Object} options
	 * @param {String} [options.sectionName] is the name of the topmost list
	 *   section under rootNode, if the top section is an array.
	 * @param {Function} options.identify is a function that returns a unique
	 *   identifier for an object.  The returned value does not have to be a
	 *   string.
	 * @param {Function} options.compare is a function that compares two
	 *   objects to determine their sort order and should return -1, 0, or 1.
	 * @param {Function} [options.qsa] is a query selector
	 *   function like jQuery(selector) or dojo.query(selector).
	 *   Defaults to the browser's querySelectorAll, if available.
	 * @param {Array} [options.cssBindings] (TODO) if omitted, assumes data-bard-bind
	 *   and data-bard-section attributes in the dom describe the bindings.
	 * @param {Boolean} [options.preserve] should be set to truthy
	 *   to leave the data-bard-bind attrs in the dom after processing
	 *   a node tree.
	 */
	function NodeCollection (rootNode, options) {
		var topSection, modelNode;

		options = Object.create(options);

		if (!options.qsa) options.qsa = dom.qsa;
		if (!options.sectionAttr) options.sectionAttr = base.sectionAttr;

		// if there are no sections, use the root node.
		topSection = this.findSectionNode(rootNode, options) || rootNode;

		// yank out the contents from top section and use it as a template.
		// TODO: support dom fragments and legacy browsers that don't have firstElementChild
		modelNode = topSection.removeChild(topSection.firstElementChild);

		this.rootNode = rootNode;
		this.sectionNode = topSection;
		this.modelNode = modelNode;
		this.options = options;
		this.binder = options.binder;
		this.proxy = options.metadata.model;
		this.metadata = options.metadata;

		this.bindings = [];
		// binding = { model, node, push, pull }

	}

	NodeCollection.prototype = {

		observe: function() {
			return most.fromEventTarget(this.rootNode, 'change')
				.map(eventToChangeRecord(this))
				.filter(notNull)
				.bufferTime(10);
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
			binding = null;

			// if this node isn't in our tree, bail early
			if (!this.containsNode(this.rootNode, node)) return binding;
			// for each top-level binding, compare node position.
			// the cost of not using attribute turds is that we must loop
			// through all possible nodes.
			// TODO: use poly/array array.find()
			this.bindings.some(function (b) {
				if (this.containsNode(b.node, node)) {
					return binding = b;
				}
			}, this);

			return binding;
		},

		insertModel: function (model) {
			var newBinding, newPos;

			newBinding = {
				model: model,
				node: this.modelNode.cloneNode(true)
			};

			newPos = this.sortedPos(model);

			this.bindings.splice(newPos, 0, newBinding);

			this.insertModelNode(newBinding.node, newPos);

			this.createAccessors(newBinding, this.options);

			// push model into the dom
			this.pushData(newBinding, this.options);

			return model;
		},

		updateModel: function (newModel, oldModel) {
			var binding, oldPos, newPos;

			oldPos = this.exactPos(oldModel);
			newPos = this.sortedPos(newModel);

			binding = this.bindings[oldPos];
			binding.model = newModel;

			if (oldPos != newPos) {
				this.bindings.splice(newPos, 0, binding);
				this.bindings.splice(oldPos, 1);
				this.insertModelNode(binding.node, newPos);
			}

			// push model into the dom
			this.pushData(binding, this.options);

			return newModel;
		},

		deleteModel: function (oldModel) {
			var oldPos, oldBinding;

			oldPos = this.exactPos(oldModel);
			oldBinding = this.bindings[oldPos];

			this.bindings.splice(oldPos, 1);

			this.deleteModelNode(oldBinding.node);

			return oldModel;
		},

		clearModel: function () {
			this.bindings.forEach(function (binding) {
				this.deleteModelNode(binding.node);
			}, this);
			this.bindings = [];
		},

		sortedPos: function (model) {
			var compare, bindings, pos;
			compare = this.options.compare;
			bindings = this.bindings;
			return search.binary(
				0,
				this.bindings.length,
				function (pos) { return compare(bindings[pos].model, model); }
			);
		},

		exactPos: function (model) {
			var compare, identify, bindings, approx, id;
			compare = this.options.compare;
			identify = this.options.identify;
			bindings = this.bindings;
			approx = this.sortedPos(model);
			id = identify(model);
			return search.grope(
				approx,
				0,
				this.bindings.length,
				function (pos) { return identify(bindings[pos].model) === id; },
				function (pos) { return compare(bindings[pos].model, model); }
			);
		},

		insertModelNode: function (modelNode, pos) {
			var sibling, siblingNode;
			// find previous sibling (undefined is ok)
			sibling = this.bindings[pos - 1];
			siblingNode = sibling && sibling.node;
			// insert node into dom
			this.sectionNode.insertBefore(modelNode, siblingNode);
			return modelNode;
		},

		deleteModelNode: function (modelNode) {
			this.sectionNode.removeChild(modelNode);
			return modelNode;
		},

		findSectionNode: base.findSectionNode,

		binder: base.binder,

		pushData: base.pushData,

		pullData: base.pullData,

		createAccessors: base.createAccessors,

		containsNode: base.containsNode

	};

	function eventToChangeRecord(self) {
		return function(e) {
			var binding = self.findBinding(e);
			if(binding) {
				var model = binding.model;
				var diff = self.metadata.modelMetadata.diff(model);
				self.pullData(binding);

				return {
					type: 'updated',
					name: 0,
					object: [model],
					oldValue: model,
					changes: diff(model)
				};
			}

			return null;
		};
	}

	function notNull(x) {
		return x != null;
	}

	return NodeCollection;

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));
