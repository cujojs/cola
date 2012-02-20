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
	function DomCollectionAdapter(itemNode) {
		var container;

		container = arguments[1] || itemNode.parentNode;

		if (!container) {
			throw new Error('No container node found for DomCollectionAdapter.');
		}

		this._containerNode = container;

		this._itemNode = itemNode;

		if (itemNode.parentNode) {
			itemNode.parentNode.removeChild(itemNode);
		}

		// list of data items
		this._items = [];

	}

	DomCollectionAdapter.prototype = {

		watch: function (itemAdded, itemUpdated, itemRemoved) {
			var unwatchAdded, unwatchUpdated, unwatchRemoved;
			unwatchAdded = watchNode(this._containerNode, colaAddedEvent, function (evt) {
				itemAdded(evt.data.item, evt.data.index);
			});
			unwatchUpdated = watchNode(this._containerNode, colaUpdatedEvent, function (evt) {
				itemUpdated(evt.data.item, evt.data.index);
			});
			unwatchRemoved = watchNode(this._containerNode, colaRemovedEvent, function (evt) {
				itemRemoved(evt.data.item, evt.data.index);
			});
			return function () {
				unwatchAdded();
				unwatchUpdated();
				unwatchRemoved();
			};
		},

		add: function (item, index) {
			var node, adapted;
			node = this._itemNode.cloneNode(true);
			// insert into container
			if (this.comparator) {
				index = findInsertionIndex(item, this._items, this.comparator);
			}
			this._items.splice(index, 0, item);
			insertAtDomIndex(this._containerNode, node, index);
			// notify listeners
			this._fireEvent(colaAddedEvent, item, index );
			// return node so the mediator can adapt it and sync it
			return node;
		},

		update: function (item, index) {
			var node, prevIndex;
			// find existing position (don't use comparator because item changed)
			prevIndex = findIndex(item, this._items);
			// move to another position
			if (this.comparator) {
				index = findInsertionIndex(item, this._items, this.comparator);
			}
			if (prevIndex != index) {
				node = this._containerNode.childNodes[prevIndex];
				this._items.splice(prevIndex, 1);
				this._items.splice(index, 0, item);
				insertAtDomIndex(this._containerNode, node, index);
				// notify listeners
				this._fireEvent(colaUpdatedEvent, item, index );
			}
			return node;
		},

		remove: function (item, index) {
			var node;
			if (this.comparator) {
				index = findInsertionIndex(item, this._items, this.comparator);
			}
			node = this._containerNode.removeChild(this._containerNode.childNodes[index]);
			// notify listeners
			this._fireEvent(colaRemovedEvent, item, index );
			return node;
		},

		/**
		 * Compares to data items.  Works just like the comparator function
		 * for Array.prototype.sort.  Should be injected.  Default is to
		 * not sort if not supplied.
		 * @param a {Object}
		 * @param b {Object}
		 * @returns {Number} -1, 0, 1
		 */
		comparator: undef,

		_fireEvent: function (type, item, index) {
			fireSimpleEvent(this._containerNode, type, { item: item, index: index });
		},

		_insertNodeAndItem: function (node, item, index) {
			if (this.comparator) {
				index = findInsertionIndex(item, this._items, this.comparator);
			}
			this._items.splice(index, 0, item);
			insertAtDomIndex(this._containerNode, node, index);
		}

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

	function findIndex (item, list) {
		var i;
		i = list.length;
		while (i >= 0 && list[--i] != item) {}
		return i;
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