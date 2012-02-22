(function (define, global) {
define(function(require) {
"use strict";

	var domEvents, fireSimpleEvent, watchNode,
		undef;

	domEvents = require('./dom/events');
	fireSimpleEvent = domEvents.fireSimpleEvent;
	watchNode = domEvents.watchNode;

	/**
	 * Manages a collection of dom trees that are synced with a data
	 * collection.
	 * @constructor
	 * @param templateNode {DOMNode} node to serve as a template for items
	 * in the collection / list.
	 * @param containerNode {DOMNode} optional parent to all itemNodes. If
	 * omitted, the parent of templateNode is assumed to be containerNode.
	 */
	function NodeListAdapter (templateNode) {
		var container;

		container = arguments[1] || templateNode.parentNode;

		if (!container) {
			throw new Error('No container node found for NodeListAdapter.');
		}

		this._containerNode = container;

		this._templateNode = templateNode;
		this._initTemplateNode();

		// list of sorted data items, nodes, and unwatch functions
		this._itemData = [];

	}

	NodeListAdapter.prototype = {

		watch: function (add, remove) {
			var unwatchAdd, unwatchRemove;
			unwatchAdd = add ?
				watchNode(this._containerNode, colaAddedEvent, function (evt) {
					add(evt.data.item);
				}) : noop;
			unwatchRemove = remove ?
				watchNode(this._containerNode, colaRemovedEvent, function (evt) {
					remove(evt.data.item);
				}) : noop;
			return function () {
				unwatchAdd();
				unwatchRemove();
			};
		},

		add: function (item) {
			var itemData, self, index;
			if (typeof this.comparator != 'function') {
				throw createError('NodeListAdapter: Cannot add without a comparator.', item);
			}
			itemData = { item: item };
			// create node
			itemData.node = this._templateNode.cloneNode(true);
			// find index
			index = findSortedIndex(item, this._itemData, this.comparator);
			// save all data
			this._itemData.splice(index, 0, itemData);
			// insert into container
			this._insertNodeAt(itemData.node, index);
			// notify listeners
			this._fireEvent(colaAddedEvent, item);
		},

		remove: function (item) {
			var itemData, index = -1, unwatch;
			if (typeof this.comparator != 'function') {
				throw createError('NodeListAdapter: Cannot remove without a comparator.', item);
			}
			index = findSortedIndex(item, this._itemData, this.comparator);
			if (index < 0 || index > this._itemData.length) {
				throw createError('NodeListAdapter: Cannot remove item.', item);
			}
			itemData = this._itemData[index];
			// remove node
			this._removeNode(itemData.node);
			// remove itemData
			this._itemData.splice(index, 1);
			// notify listeners
			this._fireEvent(colaRemovedEvent, item);
		},

		forEach: function (lambda) {
			for (var i = 0, len = this._itemData.length; i < len; i++) {
				lambda(this._itemData[i].item);
			}
		},

		checkPosition: function (item) {
			var itemData, oldIndex, newIndex;
			if (typeof this.comparator != 'function') {
				throw createError('NodeListAdapter: Cannot move without a comparator.', item);
			}
			// first check in the already sorted place (optimization)
			oldIndex = findSortedIndex(item, this._itemData, this.comparator);
			if (item != this._itemData[oldIndex]) {
				// apparently, it did move!
				newIndex = findIndex(item, this._itemData, this.comparator);
				if (newIndex < 0 || newIndex > this._itemData.length) {
					throw createError('NodeListAdapter: Cannot move item.', item);
				}
				itemData = this._itemData[newIndex];
				// move item and node
				this._itemData.splice(newIndex, 0, this._itemData.splice(oldIndex, 1));
				this._insertNodeAt(itemData.node, newIndex);
			}
		},

		setBindings: function (bindings) {
			this._bindings = bindings;
		},

		getBindings: function () {
			return this._bindings;
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

		// TODO: enable this by incorporating a decent map:
//		symbolizer: undef,

		_initTemplateNode: function () {
			var templateNode = this._templateNode;
			// remove from document
			if (templateNode.parentNode) {
				templateNode.parentNode.removeChild(templateNode);
			}
			// remove id because we're going to duplicate
			if (templateNode.id) {
				templateNode.id = '';
			}
		},

		_fireEvent: function (type, item) {
			fireSimpleEvent(this._containerNode, type, { item: item });
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

		_removeNode: function (node) {
			var parent;
			parent = this._containerNode;
			parent.removeChild(node);
		}

	};

	NodeListAdapter.canHandle = function (obj) {
		// crude test if an object is a node.
		return obj && obj.tagName && obj.insertBefore && obj.removeChild;
	};

	var colaAddedEvent, colaRemovedEvent, colaUpdatedEvent;

	colaAddedEvent = '-cola-item-added';
	colaRemovedEvent = '-cola-item-removed';

	/**
	 * This binary search isn't quite like most because it also
	 * determines where to insert an item that falls between two
	 * others in the list.
	 * @param item {Object}
	 * @param list {Array} of objects
	 * @param comparator {Function} function sort (a, b) { return a - b; }
	 * @returns {Number} the number at which to insert into the list
	 */
	function findSortedIndex (item, list, comparator) {
		var min, max, mid, compare;

		// starting bounds are slightly larger than list
		// so we can detect if the new items will go before the
		// first item or after the last
		min = -1;
		max = list.length;

		while ((max - min > 1) && compare != 0) {
			mid = Math.floor((min + max) / 2);
			compare = comparator(item, list[mid].item);
			// don't use mid +/- 1 or we may miss in-between
			if (compare > 0) min = mid;
			else if (compare < 0) max = mid;
		}

		// compare will be non-zero if we ended up between two existing items
		return compare > 0 ? max : mid;
	}

	/**
	 * This straight scan uses the comparator to test each item in
	 * the list for equality and returns the first it finds or -1.
	 * @param item {Object}
	 * @param list {Array} of objects
	 * @param comparator {Function} function sort (a, b) { return a - b; }
	 */
	function findIndex (item, list, comparator) {
		var i;
		i = list.length;
		while (--i >= 0 && comparator(item, list[i].item) != 0) {}
		return i;
	}

	function createError(message, data) {
		var error = new Error(message);
		error.data = data;
		return error;
	}

	function noop () {}

	return NodeListAdapter;

});
}(
	typeof define == 'function'
		? define
		: function (factory) { module.exports = factory(require); },
	this
));