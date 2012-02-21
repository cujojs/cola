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
	 * @param itemNode {DOMNode} node to serve as a template for items
	 * in the collection / list.
	 * @param containerNode {DOMNode} optional parent to all itemNodes. If
	 * omitted, the parent of itemNode is assumed to be containerNode.
	 */
	function NodeListAdapter (itemNode) {
		var container;

		container = arguments[1] || itemNode.parentNode;

		if (!container) {
			throw new Error('No container node found for NodeListAdapter.');
		}

		this._containerNode = container;

		this._itemNode = itemNode;

		// list of sorted data items
		this._items = [];

	}

	NodeListAdapter.prototype = {

		watch: function (itemAdded, itemUpdated, itemRemoved) {
			var unwatchAdded, unwatchUpdated, unwatchRemoved;
			unwatchAdded = itemAdded ?
				watchNode(this._containerNode, colaAddedEvent, function (evt) {
					itemAdded(evt.data.item);
				}) : noop;
			unwatchUpdated = itemUpdated ?
				watchNode(this._containerNode, colaUpdatedEvent, function (evt) {
					itemUpdated(evt.data.item);
				}) : noop;
			unwatchRemoved = itemRemoved ?
				watchNode(this._containerNode, colaRemovedEvent, function (evt) {
					itemRemoved(evt.data.item);
				}) : noop;
			return function () {
				unwatchAdded();
				unwatchUpdated();
				unwatchRemoved();
			};
		},

		itemAdded: function (item) {
			var node;
			node = this._itemNode.cloneNode(true);
			// insert into container
			this._insertNodeAndItem(node, item);
			// notify listeners
			this._fireEvent(colaAddedEvent, item);
			// return node so the mediator can adapt it and sync it
			return node;
		},

		itemUpdated: function (item) {
			var current, newIndex;
			// find existing node, ignore sort since item changed
			current = this._removeNodeAndItem(item, true, true);
			// move node and item to another position
			newIndex = this._insertNodeAndItem(current.node, item);
			if (current.index != newIndex) {
				// notify listeners
				this._fireEvent(colaUpdatedEvent, item);
			}
			// return node only if we swapped it for another (and we didn't!)
			// return current.node;
		},

		itemRemoved: function (item) {
			this._removeNodeAndItem(item);
			// notify listeners
			this._fireEvent(colaRemovedEvent, item);
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

		_initItemNode: function () {
			var itemNode = this._itemNode;
			// remove from document
			if (itemNode.parentNode) {
				itemNode.parentNode.removeChild(itemNode);
			}
			// remove id because we're going to duplicate
			if (itemNode.id) {
				itemNode.id = '';
			}
		},

		_fireEvent: function (type, item) {
			fireSimpleEvent(this._containerNode, type, { item: item });
		},

		_insertNodeAndItem: function (node, item) {
			var index, parent, refNode;
			if (typeof this.comparator != 'function') {
				throw createError('NodeListAdapter: Cannot insert without a comparator.', item);
			}
			index = findSortedIndex(item, this._items, this.comparator);
			this._items.splice(index, 0, item);
			parent = this._containerNode;
			refNode = parent.childNodes[index];
			// Firefox cries when you try to insert before yourself
			// which can happen if we're moving into the same position.
			if (node != refNode) {
				parent.insertBefore(node, refNode);
			}
			return index;
		},

		_removeNodeAndItem: function (item, ignoreSort, dontRemoveNode) {
			var node, index = -1, parent;
			if (typeof this.comparator != 'function') {
				throw createError('NodeListAdapter: Cannot remove without a comparator.', item);
			}
			if (ignoreSort) {
				// straight scan (sort is invalid for this item)
				index = findIndex(item, this._items, this.comparator);
			}
			else {
				// binary search
				index = findSortedIndex(item, this._items, this.comparator);
			}
			if (index < 0 || index > this._items.length) {
				throw createError('NodeListAdapter: Cannot remove item.', item);
			}
			this._items.splice(index, 1);
			parent = this._containerNode;
			node = parent.childNodes[index];
			if (!dontRemoveNode) parent.removeChild(node);
			return {
				index: index,
				node: node
			};
		}

	};

	NodeListAdapter.canHandle = function (obj) {
		// crude test if an object is a node.
		return obj && obj.tagName && obj.insertBefore && obj.removeChild;
	};

	var colaAddedEvent, colaRemovedEvent, colaUpdatedEvent;

	colaAddedEvent = '-cola-item-added';
	colaRemovedEvent = '-cola-item-removed';
	colaUpdatedEvent = '-cola-item-updated';

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
			mid = Math.round((min + max) / 2);
			compare = comparator(item, list[mid]);
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
		while (--i >= 0 && comparator(list[i], item) != 0) {}
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