/** MIT License (c) copyright B Cavalier & J Hann */

(function (define) {
define(function (require) {
"use strict";

	var methodsToForward, ObjectMediator;

	methodsToForward = ['add', 'remove'];

	ObjectMediator = require('./SimpleMediator');

	/**
	 * Sets up mediation between two collection adapters
	 * @param primary {Object} collection adapter
	 * @param secondary {Object} collection adapter
	 * @param resolver {Function} function (object, type) { returns Adapter; }
	 * @param options {Object} options
	 * @param options.bind if truthy, immediately synchronize data primary
	 *   primary secondary secondary.
	 */
	return function (primary, secondary, resolver, options) {

		var itemMap1, itemMap2, mediationHandler1, mediationHandler2,
			watchHandler1, unwatch1, unwatch2;

		if (!options) options = {};

		// these maps keep track of items that are being watched
		itemMap1 = createMap(primary.comparator, primary.symbolizer);
		itemMap2 = createMap(secondary.comparator, secondary.symbolizer);

		// these functions handle any item-to-item mediation
		mediationHandler1 = createItemMediatorHandler(primary, itemMap1, resolver);
		mediationHandler2 = createItemMediatorHandler(secondary, itemMap2, resolver);

		// this function handles property changes that could affect collection order
		watchHandler1 = createItemWatcherHandler(primary, secondary, resolver);

		if (!('sync' in options) || options.sync) {
			primary.forEach(function (item) {
				var copy;
				// watch for item changes
				watchHandler1(item, primary, itemMap1);
				// push item into secondary
				copy = secondary.add(item);
				// if secondary returns a copy
				if (copy) {
					mediationHandler1(copy, item, secondary);
				}
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

	function createAdapter (object, resolver, type, options) {
		var Adapter = resolver(object, type);
		return new Adapter(object, options);
	}

	function createItemWatcherHandler (primary, secondary, resolver) {
		if (typeof primary.checkPosition == 'function' || typeof secondary.checkPosition == 'function') {
			return function watchItem (item, target, itemMap) {
				var itemData, newAdapter;
				itemData = itemMap.get(item);
				if (itemData) {
					// the item was already being watched
					// TODO: do we care?
					if (itemData.unwatch) itemData.unwatch();
				}
				else {
					itemData = itemMap.set(item, {
						adapter: createAdapter(item, resolver, 'object', target.getBindings())
					});
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

	function createItemMediatorHandler (sender, itemMap, resolver) {
		return function discoverItem (newItem, refItem, target) {
			var itemData, newAdapter;
			itemData = itemMap.get(refItem);
			if (itemData) {
				// the item was already being mediated
				if (itemData.unmediate) itemData.unmediate();
			}
			else {
				itemData = itemMap.set(refItem, {
					adapter: createAdapter(refItem, resolver, 'object', sender.getBindings())
				});
			}
			newAdapter = createAdapter(newItem, resolver, 'object', target.getBindings());
			itemData.unmediate = ObjectMediator(itemData.adapter, newAdapter);
		}
	}

	function createForwarder (method, discoveryCallback) {
		function doForward(target, item, index) {
			var copy, copyAdapter;
			this.forwardTo = noop;
			try {
				copy = target[method](item, index);
			} finally {
				this.forwardTo = doForward;
			}
			// if adapter2 returns a copy
			if (copy) {
				discoveryCallback(copy, item, target);
			}
		}

		return {
			forwardTo: doForward
		};
	}

	function createCallback (forwarder, to) {
		return function (item, index) {
			forwarder.forwardTo(to, item, index);
		}
	}

	function initForwarding (from, to, discoveryCallback) {
		var forwarder, callbacks, i, len;

		callbacks = [];
		for (i = 0, len = methodsToForward.length; i < len; i++) {
			forwarder = createForwarder(methodsToForward[i], discoveryCallback);
			callbacks.push(createCallback(forwarder, to));
		}

		// if adapter2 wants a keyFunc and doesn't have one, copy it from adapter1
		if ('symbolizer' in to && !to.symbolizer && from.symbolizer) {
			to.symbolizer = from.symbolizer;
		}
		// if adapter2 wants a comparator and doesn't have one, copy it from adapter1
		if ('comparator' in to && !to.comparator && from.comparator) {
			to.comparator = from.comparator;
		}

		return from.watch.apply(from, callbacks);
	}

	// it's pretty clear we need to share this kind of thing all over the place :)
	function createMap (comparator, symbolizer) {
		var index, list, finder;

		index = {};
		list = [];

		function scan (key) {
			var i, entry;
			i = list.length;
			while ((entry = list[--i])) if (entry.object == key) return i;
		}

		function search (key) {
			var min, max, mid, compare;
			min = 0;
			max = list.length;
			do {
				mid = Math.floor((min + max) / 2);
				compare = comparator(key, list[mid].key);
				// don't use mid +/- 1 or we may miss in-between
				if (compare > 0) min = mid;
				else if (compare < 0) max = mid;
				else return mid;
			}
			while (max - min > 1 && !isNaN(compare));
		}

		if (!symbolizer) {
			if (comparator) finder = search;
			else finder = scan;
		}

		if (symbolizer) return {
			get: function (key) {
				return list[index[symbolizer(key)]];
			},
			set: function (key, object) {
				index[symbolizer(key)] = list.push(object);
				return object;
			},
			remove: function (key) {
				var name = symbolizer(key);
				delete list[index[name]]; // makes the array sparse
				delete index[name];
			},
			forEach: function (lambda) {
				for (var p in index) lambda(list[index[p]], p);
			}
		};
		else return {
			get: function (key) {
				var entry = list[finder(key)];
				return entry && entry.object;
			},
			set: function (key, object) {
				list.splice(finder(key) || list.length, 0, { key: key, object: object});
				return object;
			},
			remove: function (key) {
				list.splice(finder(key) || list.length, 1);
			},
			forEach: function (lambda) {
				var i, entry;
				i= list.length;
				while ((entry = list[--i])) lambda(entry.object, entry.key);
			}
		}
	}

	function noop () {}

});
}(
	typeof define == 'function'
		? define
		: function (factory) { module.exports = factory(require); }
));
