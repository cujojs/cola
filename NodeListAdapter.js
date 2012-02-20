(function (define, global) {
define(function(require) {
"use strict";

	var NodeAdapter, domEvents, fireSimpleEvent, watchNode,
		undef;

	NodeAdapter = require('./NodeAdapter');
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
	 * omitted, the parent of itemNode is assumed.
	 */
	function DomCollectionAdapter(itemNode) {
		var container;

		container = arguments[1] || itemNode.parentNode;

		if (!container) {
			throw new Error('No container node found for DomCollectionAdapter.');
		}

		this._containerNode = container;

		this._itemNode = itemNode;

		if (itemNode.parentNode) {
			// TODO: is this always what we want to do?
			itemNode.parentNode.removeChild(itemNode);
		}

		// list of data items
		this._items = [];

	}

	DomCollectionAdapter.prototype = {

		watch: function (itemAdded, itemUpdated, itemRemoved) {
			var unwatchAdded, unwatchUpdated, unwatchRemoved;
			unwatchAdded = watchNode(this._containerNode, colaAddedEvent, function (evt) {
				itemAdded(evt.data.item);
			});
			unwatchUpdated = watchNode(this._containerNode, colaUpdatedEvent, function (evt) {
				itemUpdated(evt.data.item);
			});
			unwatchRemoved = watchNode(this._containerNode, colaRemovedEvent, function (evt) {
				itemRemoved(evt.data.item);
			});
			return function () {
				unwatchAdded();
				unwatchUpdated();
				unwatchRemoved();
			};
		},

		add: function (item, index) {
			var domTree, adapted;
			domTree = this._itemNode.cloneNode(true);
			// insert into container
			if (this.comparator) {
				index = findInsertionIndex(item, this._items, this.comparator);
			}
			this._items.splice(index, 0, item);
			insertAtDomIndex(this._containerNode, domTree, index);
			// make adapted
			adapted = new NodeAdapter(domTree);
			// return domTree so the mediator can sync it????
			// TODO: this doesn't seem to be in the right order. fire event before domTree is sync with itemed?
			fireSimpleEvent(this._containerNode, colaAddedEvent, { item: item, index: index });
			return adapted;
		},

		update: function (item, index) {
			var domTree;
			// move to another position
			if (this.comparator) {
				index = findInsertionIndex(item, this._items, this.comparator);
			}
			domTree = this._containerNode.childNodes[index];
			insertAtDomIndex(this._containerNode, domTree, index);
			// TODO: this doesn't seem to be in the right order.
			fireSimpleEvent(this._containerNode, colaUpdatedEvent, { item: item, index: index });
			return domTree;
		},

		remove: function (item, index) {
			var domTree;
			if (this.comparator) {
				index = findInsertionIndex(item, this._items, this.comparator);
			}
			this._containerNode.removeChild(this._containerNode.childNodes[index]);
			// TODO: this doesn't seem to be in the right order.
			fireSimpleEvent(this._containerNode, colaRemovedEvent, { item: item, index: index });
			return item;
		},

		/**
		 * Compares to data items.  Works just like the comparator function
		 * for Array.prototype.sort.  Should be injected.  Default is to
		 * not sort if not supplied.
		 * @param a {Object}
		 * @param b {Object}
		 * @returns {Number} -1, 0, 1
		 */
		comparator: undef

	};

	var colaAddedEvent, colaRemovedEvent, colaUpdatedEvent;

	colaAddedEvent = '-cola-item-added';
	colaRemovedEvent = '-cola-item-removed';
	colaUpdatedEvent = '-cola-item-updated';

	return DomCollectionAdapter;

	function findInsertionIndex (item, list, comparator) {
		var bisect, prev, refItem, compare;

		bisect = prev = list.length;
		compare = -1;
		// if there's no comparator, list.length is returned (append to end)
		if (comparator) {
			do {
				bisect = bisect + ~~(bisect / 2) * compare;
				refItem = list[bisect];
				compare = comparator(item, refItem);
			}
			while (Math.abs(prev - bisect) > 0);
		}
		return compare > 0 ? bisect : prev;
	}

	function insertAtDomIndex (node, parent, index) {
		var refNode = parent.childNodes[index];
		parent.insertBefore(node, refNode);
		return node;
	}

});
}(
	typeof define == 'function'
		? define
		: function (factory) { module.exports = factory(require); },
	this
));