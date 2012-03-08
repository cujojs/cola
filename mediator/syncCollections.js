/** MIT License (c) copyright B Cavalier & J Hann */

(function (define) {
define(function (require) {
"use strict";

	var methodsToForward, syncProperties, when, SortedMap;

	when = require('when');

	SortedMap = require('../SortedMap');
	syncProperties = require('./syncProperties');

	methodsToForward = ['add', 'remove'];

	/**
	 * Sets up mediation between two collection adapters
	 * @param primary {Object} collection adapter
	 * @param secondary {Object} collection adapter
	 * @param createAdapter {Function} function (object, type, options) { returns adapter; }
	 * @param options {Object} options
	 * @param options.bind if truthy, immediately synchronize data primary
	 *   primary secondary secondary.
	 */
	return function syncCollections (primary, secondary, createAdapter, options) {

		var itemMap1, itemMap2, mediationHandler1, mediationHandler2,
			watchHandler1, unwatch1, unwatch2;

		if (!options) options = {};

		// if adapter2 wants a keyFunc and doesn't have one, copy it from adapter1
		if ('symbolizer' in secondary && !secondary.symbolizer && primary.symbolizer) {
			secondary.symbolizer = primary.symbolizer;
		}
		// if adapter2 wants a comparator and doesn't have one, copy it from adapter1
		if ('comparator' in secondary && !secondary.comparator && primary.comparator) {
			secondary.comparator = primary.comparator;
		}

		// these maps keep track of items that are being watched
		itemMap1 = new SortedMap(primary.symbolizer, primary.comparator);
		itemMap2 = new SortedMap(secondary.symbolizer, secondary.comparator);

		// these functions handle any item-to-item mediation
		mediationHandler1 = createItemMediatorHandler(primary, itemMap1, createAdapter, options);
		mediationHandler2 = createItemMediatorHandler(secondary, itemMap2, createAdapter, options);

		// this function handles property changes that could affect collection order
		watchHandler1 = createItemWatcherHandler(primary, secondary, createAdapter);

		// TODO: This intitial sync may need to cause other operations to delay
		// until it is complete (which may happen async if secondary is async)
		if (!('sync' in options) || options.sync) {
			primary.forEach(function (item) {
				// watch for item changes
				watchHandler1(item, primary, itemMap1);
				// push item into secondary
				when(secondary.add(item), function(copy) {
					// if secondary returns a copy
					if (copy) {
						mediationHandler1(copy, item, secondary);
					}

					return copy;
				});
			});
		}

		unwatch1 = initForwarding(primary, secondary, mediationHandler1);
		unwatch2 = initForwarding(secondary, primary, mediationHandler2);

		return function () {
			itemMap1.forEach(unwatchItemData);
			itemMap2.forEach(unwatchItemData);
			unwatch1();
			unwatch2();
		};
	};

	function unwatchItemData (data) {
		if (data.unwatch) data.unwatch();
		if (data.unmediate) data.unmediate();
	}

//	function createAdapter (object, resolver, type, options) {
//		var Adapter = resolver(object, type);
//		if (!Adapter) throw new Error('syncCollections: could not find Adapter constructor for ' + type);
//		return new Adapter(object, options);
//	}

	function createItemWatcherHandler (primary, secondary, createAdapter) {
		if (typeof primary.checkPosition == 'function' || typeof secondary.checkPosition == 'function') {
			return function watchItem (item, target, itemMap) {
				var itemData;
				itemData = itemMap.get(item);
				if (itemData) {
					// the item was already being watched
					// TODO: do we care?
					if (itemData.unwatch) itemData.unwatch();
				}
				else {
					itemData = { adapter: createAdapter(item, 'object', target.getOptions()) };
					itemMap.add(item, itemData);
				}
				itemData.unwatch = itemData.adapter.watchAll(function (prop, value) {
					// if primary requires ordering, tell it that the item may have moved
					// TODO: if adapter returned another copy, lose previous copy, adapt this one, and start watching it
					if (typeof primary.checkPosition == 'function') primary.checkPosition(item);
					// if secondary requires ordering, tell it that the item may have moved
					// TODO: if adapter returned another copy, lose previous copy, adapt this one, and start watching it
					if (typeof secondary.checkPosition == 'function') secondary.checkPosition(item);
				});
				return itemData;
			}
		}
		else {
			return noop;
		}
	}

	function createItemMediatorHandler (sender, itemMap, createAdapter, options) {
		return function discoverItem (newItem, refItem, target) {
			var itemData, newAdapter;
			itemData = itemMap.get(refItem);
			if (itemData) {
				// the item was already being mediated
				if (itemData.unmediate) itemData.unmediate();
			}
			else {
				itemData = { adapter: createAdapter(refItem, 'object', sender.getOptions()) };
				itemMap.add(refItem, itemData);
			}
			newAdapter = createAdapter(newItem, 'object', target.getOptions());
			itemData.unmediate = syncProperties(itemData.adapter, newAdapter, options);
		}
	}

	function createForwarder (method, discoveryCallback) {
		return function doForward(target, item) {
			return when(target[method](item),
				function(copy) {
					// if adapter2 returns a copy we need to propagate it
					if (copy) {
						return discoveryCallback(copy, item, target);
					}
				}
			);
		};
	}

	function createCallback (forwarder, to) {
		return function (item) {
			return forwarder(to, item);
		}
	}

	function initForwarding (from, to, discoveryCallback) {
		var forwarder, callbacks, i, len;

		callbacks = [];
		for (i = 0, len = methodsToForward.length; i < len; i++) {
			forwarder = createForwarder(methodsToForward[i], discoveryCallback);
			callbacks.push(createCallback(forwarder, to));
		}

		return from.watch.apply(from, callbacks);
	}

	function noop () {}

});
}(
	typeof define == 'function'
		? define
		: function (factory) { module.exports = factory(require); }
));
