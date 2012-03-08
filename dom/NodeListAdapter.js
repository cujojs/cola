(function (define) {
define(function(require) {
"use strict";

	var when, SortedMap, classList, domEvents, fireSimpleEvent, watchNode,
		colaAddedEvent, colaRemovedEvent, colaPropUpdatedEvent,
		undef, defaultTemplateSelector, listElementsSelector,
		colaListBindingStates;

	when = require('when');
	SortedMap = require('../SortedMap');
	classList = require('./classList');
	domEvents = require('./events');

	fireSimpleEvent = domEvents.fireSimpleEvent;
	watchNode = domEvents.watchNode;

	colaAddedEvent = 'ColaItemAdded';
	colaRemovedEvent = 'ColaItemRemoved';
	colaPropUpdatedEvent = 'ColaItemPropUpdated';

	defaultTemplateSelector = '[data-cola-role="item-template"]';
	listElementsSelector = 'tr,li';

	colaListBindingStates = {
		empty: 'cola-list-empty',
		bound: 'cola-list-bound',
		unbound: 'cola-list-unbound'
	};

	/**
	 * Manages a collection of dom trees that are synced with a data
	 * collection.
	 * @constructor
	 * @param rootNode {Node} node to serve as a template for items
	 * in the collection / list.
	 * @param options.comparator {Function} comparator function to use for
	 *  ordering nodes
	 * @param options.containerNode {Node} optional parent to all itemNodes. If
	 * omitted, the parent of rootNode is assumed to be containerNode.
	 * @param options.querySelector {Function} DOM query function
	 */
	function NodeListAdapter (rootNode, options) {
		var container, self;

		if(!options) options = {};

		this._options = options;

		this.comparator = options.comparator;
		this.symbolizer = options.symbolizer;

		this._rootNode = rootNode;

		// 1. find templateNode
		this._templateNode = findTemplateNode(rootNode, options);

		// 2. get containerNode
		// TODO: should we get the container node just-in-time?
		container = options.containerNode || this._templateNode.parentNode;

		if (!container) {
			throw new Error('No container node found for NodeListAdapter.');
		}

		this._containerNode = container;

		this._initTemplateNode();

		// keep track of how many watchers. we assume that if number
		// of watchers is greater than zero, we're "data bound"
		this._watchCount = 0;
		this._checkBoundState();

		self = this;
		// list of sorted data items, nodes, and unwatch functions
		this._itemData = new SortedMap(
			function(item) {
				return self.symbolizer(item);
			}, options.comparator);

		watchNode(this._containerNode, colaPropUpdatedEvent, function () {
			// TODO: respond to property changed events in nodes
		});

	}

	NodeListAdapter.prototype = {

		watch: function (add, remove) {
			var unwatchAdd, unwatchRemove, self;

			unwatchAdd = add ?
				watchNode(this._containerNode, colaAddedEvent, function (evt) {
					return add(evt.data.item);
				}) : noop;

			unwatchRemove = remove ?
				watchNode(this._containerNode, colaRemovedEvent, function (evt) {
					return remove(evt.data.item);
				}) : noop;

			this._watchCount++;
			this._checkBoundState();

			self = this;
			return function () {
				self._watchCount--;
				self._checkBoundState();
				unwatchAdd();
				unwatchRemove();
			};
		},

		add: function (item) {
			var node, index;

			// create node
			node = this._templateNode.cloneNode(true);

			// add to map
			index = this._itemData.add(item, node);

			// figure out where to insert into dom
			if (index >= 0) {
				// insert
				this._insertNodeAt(node, index);
				// notify listeners
				// return node so mediator can adapt and mediate it
				return when(this._fireEvent(colaAddedEvent, item),
					function () { return node; }
				);
			}
		},

		remove: function (item) {
			var node, index;

			// grab node we're about to remove
			node = this._itemData.get(item);

			// remove item
			index = this._itemData.remove(item);

			// remove from dom
			// hm. we could trust that the index returned is still correct (it
			// should be!), or we could trust the node the map gave us.
			// going with the node since it seems wee bit safer.
			node.parentNode.removeChild(node);

			// notify listeners
			return this._fireEvent(colaRemovedEvent, item);
		},

		forEach: function (lambda) {
			for (var i = 0, len = this._itemData.length; i < len; i++) {
				lambda(this._itemData[i].item);
			}
		},

		checkPosition: function (item) {
//			var itemData, oldIndex, newIndex;
//			// first check in the already sorted place (optimization)
//			oldIndex = findSortedIndex(item, this._itemData, this.comparator);
//			if (item != this._itemData[oldIndex]) {
//				// apparently, it did move!
//				newIndex = findIndex(item, this._itemData, this.comparator);
//				if (newIndex < 0 || newIndex > this._itemData.length) {
//					throw createError('NodeListAdapter: Cannot move item.', item);
//				}
//				itemData = this._itemData[newIndex];
//				// move item and node
//				this._itemData.splice(newIndex, 0, this._itemData.splice(oldIndex, 1));
//				this._insertNodeAt(itemData.node, newIndex);
//			}
		},

		getOptions: function () {
			return this._options;
		},

		/**
		 * Compares two data items.  Works just like the comparator function
		 * for Array.prototype.sort. This comparator is used for two purposes:
		 * 1. to sort the items in the list (sequence)
		 * 2. to find an item in the list (identity)
		 * This property should be injected.  If not supplied, the list
		 * will rely on one assigned by a mediator.
		 * @param a {Object}
		 * @param b {Object}
		 * @returns {Number} -1, 0, 1
		 */
		comparator: undef,

		symbolizer: undef,

		_initTemplateNode: function () {
			var templateNode = this._templateNode;
			// remove from document
			if (templateNode.parentNode) {
				templateNode.parentNode.removeChild(templateNode);
			}
			// remove any styling to hide template node (ideally, devs
			// would use a css class for this, but whatevs)
			// css class: .cola-list-unbound .my-template-node { display: none }
			if (templateNode.style.display) {
				templateNode.style.display = '';
			}
			// remove id because we're going to duplicate
			if (templateNode.id) {
				templateNode.id = '';
			}
		},

		_fireEvent: function (type, item) {
			return fireSimpleEvent(this._containerNode, type, { item: item });
		},

		_insertNodeAt: function (node, index) {
			var parent, refNode;
			parent = this._containerNode;
			refNode = parent.childNodes[index];
			// Firefox cries when you try to insert before yourself
			// which can happen if we're moving into the same position.
			if (node != refNode) {
				parent.insertBefore(node, refNode);
			}
		},

		_checkBoundState: function () {
			var container, state;
			container = this._containerNode;
			state = {};
			state[colaListBindingStates.unbound] = this._watchCount == 0;
			state[colaListBindingStates.empty] = container.childNodes.length == 0;
			state[colaListBindingStates.bound] = !state[colaListBindingStates.empty];
			classList.setClassSet(this._rootNode, state);
		}

	};

	NodeListAdapter.canHandle = function (obj) {
		// crude test if an object is a node.
		return obj && obj.tagName && obj.insertBefore && obj.removeChild;
	};

	function findTemplateNode (root, options) {
		var useBestGuess, node;

		// user gave no explicit instructions
		useBestGuess = !options.itemTemplateSelector;

		if (options.querySelector) {
			// if no selector, try default selector
			node = options.querySelector(options.itemTemplateSelector || defaultTemplateSelector, root);
			// if still not found, search around for a list element
			if (!node && useBestGuess) {
				node = options.querySelector(listElementsSelector, root);
			}
		}
		if (!node && useBestGuess) {
			node = root.firstChild;
		}
		// if still not found, throw
		if (!node) {
			throw new Error('NodeListAdapter: could not find itemTemplate node');
		}
		return node;
	}

	function noop () {}

	return NodeListAdapter;

});
}(
	typeof define == 'function'
		? define
		: function (factory) { module.exports = factory(require); }
));