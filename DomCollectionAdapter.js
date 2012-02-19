(function (define, global) {
define(function(require) {
	"use strict";

	var makeWatchableDomTree, domEvents, fireSimpleEvent, watchNode;

	makeWatchableDomTree = require('./WatchableDomTree');
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

		this._containerNode = arguments[1] || itemNode.parentNode;

		if (!this._containerNode) {
			throw new Error('No container node found for DomCollectionAdapter.');
		}

		this._itemNode = itemNode;

		if (itemNode.parentNode) {
			// TODO: is this always what we want to do?
			itemNode.parentNode.removeChild(itemNode);
		}

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

		itemAdded:function (item, index) {
			var domTree, watchable, nextSibling;
			domTree = this._itemNode.cloneNode(true);
			// insert into container
			nextSibling = this._containerNode.childNodes[index];
			this._containerNode.insertBefore(domTree, nextSibling);
			watchable = makeWatchableDomTree(domTree);
			// return domTree so the mediator can sync it????
			// TODO: this doesn't seem to be in the right order. fire event before domTree is synced?
			fireSimpleEvent(this._containerNode, colaAddedEvent, { item: item, index: index });
			return watchable;
		},

		itemUpdated:function (item, index) {
			var domTree, nextSibling;
			domTree = this._containerNode.childNodes[index];
			// move to another position
			nextSibling = this._containerNode.childNodes[index];
			this._containerNode.insertBefore(domTree, nextSibling);
			// TODO: this doesn't seem to be in the right order.
			fireSimpleEvent(this._containerNode, colaUpdatedEvent, { item: item, index: index });
			return domTree;
		},

		itemRemoved:function (item, index) {
			var domTree;
			domTree = this._containerNode.childNodes[index];
			this._containerNode.removeChild(domTree);
			// return domTree so the mediator can unsync it????
			// TODO: this doesn't seem to be in the right order.
			fireSimpleEvent(this._containerNode, colaRemovedEvent, { item: item, index: index });
			return domTree;
		}

	};

	var colaAddedEvent, colaRemovedEvent, colaUpdatedEvent;

	colaAddedEvent = '-cola-item-added';
	colaRemovedEvent = '-cola-item-removed';
	colaUpdatedEvent = '-cola-item-updated';

	return DomCollectionAdapter;

});
}(
	typeof define == 'function'
		? define
		: function (factory) { module.exports = factory(require); },
	this
));