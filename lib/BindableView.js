/** @license MIT License (c) copyright 2013 original authors */
(function (define) {
define(function (require) {

	var base = require('../view/lib/base');
	var dom = require('../view/lib/dom');
	var search = require('../view/lib/search');
	var most = require('most');
	var bindByAttr = require('../view/bind/byAttr');

	/**
	 * Binds a dom node to data.
	 * @constructor
	 * @param {HTMLElement} rootNode
	 * @param {Object} options
	 * @param {String} [options.sectionName] is the name of the topmost list
	 *   section under rootNode, if the top section is an array.
	 * @param {Function} options.compare is a function that compares two
	 *   objects to determine their sort order and should return -1, 0, or 1.
	 * @param {Function} [options.qsa] is a query selector
	 *   function like jQuery(selector) or dojo.query(selector).
	 *   Defaults to the browser's querySelectorAll, if available.
	 * @param {Boolean} [options.preserve] should be set to truthy
	 *   to leave the data-bard-bind attrs in the dom after processing
	 *   a node tree.
	 */
	function BindableView (rootNode, options) {
		this.rootNode = rootNode;
		this.options = options;
	}

	var proto = {

		set: function(data, metadata) {

			this.options.metadata = metadata;
			this.options = normalizeOptions(this.options);

			this.binder = bindByAttr();
			this.metadata = metadata;
			this.proxy = metadata.model;
			this.identify = metadata.model.id;
			this.bindings = [];

			if(!this.sectionNode) {
				// if there are no sections, use the root node.
				var topSection = this.sectionNode =
					this.findSectionNode(this.rootNode, this.options) || this.rootNode;

				this.modelNode = topSection.removeChild(topSection.firstElementChild);
			}

			var self = this;
			return data.reduce(function(changes, model) {
				self.insertModel(model);
				return changes;
			}, this.changes());
		},

		clear: function() {
			if(this.bindings) {
				this.bindings.forEach(function (binding) {
					this.deleteModelNode(binding.node);
				}, this);
				delete this.bindings;
			}
			return this;
		},

		changes: function() {
			return most.fromEventTarget(this.rootNode, 'change')
				.map(eventToChangeRecord(this))
				.filter(notNull);
		},

		update: function (changes) {
			// changes is an array of objects: { type, object, name [, oldValue] }
			// type can be "new", "deleted", "updated", or "reconfigured"
			return changes.reduce(function (self, change) {
				if('remove' === change.op) {
					self.deleteModel(change.value);
				} else if('add' === change.op) {
					self.insertModel(change.value);
				} else if('replace' === change.op) {
					self.updateModel(change.value);
				}

				return self;
			}, this);
		},

		find: function (nodeOrEvent) {
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
			// HACK
			return this.insertModel(this.deleteModel(newModel));
//			var binding, oldPos, newPos;
//
//			oldPos = this.exactPos(oldModel);
//			newPos = this.sortedPos(newModel);
//
//			binding = this.bindings[oldPos];
//			binding.model = newModel;
//
//			if (oldPos != newPos) {
//				this.bindings.splice(newPos, 0, binding);
//				this.bindings.splice(oldPos, 1);
//				this.insertModelNode(binding.node, newPos);
//			}
//
//			// push model into the dom
//			this.pushData(binding, this.options);
//
//			return newModel;
		},

		deleteModel: function (oldModel) {
			var oldPos, oldBinding;

			oldPos = this.exactPos(oldModel);
			oldBinding = this.bindings[oldPos];

			this.bindings.splice(oldPos, 1);

			this.deleteModelNode(oldBinding.node);

			return oldModel;
		},

		sortedPos: function (model) {
			var compare, bindings;
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
			identify = this.identify;
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
		}
	};

	BindableView.prototype = Object.keys(proto).reduce(function(p, key) {
		p[key] = proto[key];
		return p;
	}, Object.create(base));

	function eventToChangeRecord(self) {
		return function(e) {
			var binding = self.findBinding(e);
			if(binding) {
				var model = binding.model;
				var diff = self.metadata.diff(model);
				self.pullData(binding);

				return diff(model).map(function(change) {
					change.path = '/' + self.metadata.model.id(model) + change.path;
					return change;
				});
			}

			return null;
		};
	}

	function normalizeOptions(options) {
		options = Object.create(options || null);

		if (!options.qsa) {
			options.qsa = dom.qsa;
		}
		if (!options.sectionAttr) {
			options.sectionAttr = base.sectionAttr;
		}
		if (!options.compare) {
			options.compare = createCompareForProperty(options.sortBy || 'id',
				options.metadata.model);
		}
		return options;
	}

	function createCompareForProperty (prop, proxy) {
		return function (a, b) {
			return compare(proxy.get(Object(a), prop), proxy.get(Object(b), prop));
		};
	}

	function compare (a, b) {
		return a < b ? -1 : a > b ? 1 : 0;
	}

	function notNull(x) {
		return x != null;
	}

	return BindableView;

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));
