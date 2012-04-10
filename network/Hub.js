(function (define) {
define(function () {
"use strict";

	var eventNames, beforeSending, afterSending, afterCanceling,
		undef;

	// TODO: make these configurable/extensible and allow them to be mapped to other members of an adapter
	eventNames = {
		add: 1,
		remove: 1,
		update: 1,
		edit: 1,
		cancel: 1,
		save: 1
	};

	beforeSending = {};
	afterSending = {};
	afterCanceling = {};

	/**
	 * @constructor
	 * @param strategy {strategyFunction} a strategy
	 * Strategies determine if an event gets onto the network and then how
	 * it's processed by the other adapters in the network.
	 * Only one strategy can be applied to a network. However, strategies
	 * can be composed/combined.
	 */
	function Hub (strategy) {
		var adapters, currEvents;

		adapters = [];
		currEvents = {};

		if (!strategy) strategy = simpleStrategy;

		return {
			addAdapter: addAdapter,
			sendEvent: processEvent,
			destroy: destroy
		};

		/**
		 * @memberOf Hub
		 * @param adapter
		 * @param options {Object}
		 * @param [options.eventNames] {Function} function that returns a
		 *   list of method names that should be considered events
		 *   If omitted, all methods, the standard event names are used.
		 */
		function addAdapter (adapter, options) {
			var method, eventFinder;

			// sniff for event hooks
			eventFinder = configureEventFinder(options && options.eventNames);

			for (method in adapter) {
				if (typeof adapter[method] == 'function') {
					if (eventFinder(method)) {
						adapter[method] = observedMethod(adapter, method, adapter[method]);
					}
				}
			}

			adapters.push(adapter);
		}

		function processEvent (source, data, type) {
			var i, adapter, canceled;

			currEvents[type] = source;
			try {
				canceled = false === strategy(source, beforeSending, data, type);
				i = adapters.length;

				while (!canceled && (adapter = adapters[--i])) {
					if (typeof adapter[type] == 'function') {
						if (false !== strategy(source, adapter, data, type)) {
							adapter[type](data);
						}
					}
				}

				strategy(source, canceled ? afterCanceling : afterSending, data, type);
			}
			finally {
				delete currEvents[type];
			}
		}

		function observedMethod (adapter, type, origEvent) {
			return function (data) {
				if (!(type in currEvents)) {
					processEvent(adapter, data, type);
				}
				return origEvent.call(adapter, data);
			};
		}

		function destroy () {
			var adapter;
			while ((adapter = adapters.pop())) {
				if (typeof adapter.destroy == 'function') {
					adapter.destroy();
				}
			}
		}

	}

	/**
	 * Signature for all strategy functions.
	 * @property strategyFunction
	 * @param source {Object} the adapter that sourced the event
	 * @param dest {Object} the adapter receiving the event
	 * @param data {Object} any data associated with the event
	 * @param type {String} the type of event
	 * @returns {Boolean} whether event is allowed.
	 */
	//Hub.strategyFunction = function (source, dest, data, type) {};

	/**
	 * Pseudo-item used as `dest` parameter for injecting strategies before
	 * an event is pushed onto the network.  Return false to prevent the
	 * event from being pushed.
	 */
	Hub.beforeSending = beforeSending;

	/**
	 * Psuedo-item used as `dest` parameter for injecting strategies after
	 * an event is pushed onto the network.  Return value is ignored since
	 * the event has already propagated.
	 */
	Hub.afterSending = afterSending;

	/**
	 * Psuedo-item used as `dest` parameter for injecting strategies after
	 * an event is pushed onto the network.  Return value is ignored since
	 * the event has already propagated.
	 */
	Hub.afterCanceling = afterCanceling;

	return Hub;

	/**
	 * Base network event strategy function.
	 * @type strategyFunction
	 * @private
	 * @param source {Object} the adapter that sourced the event
	 * @param dest {Object} the adapter receiving the event
	 * @param data {Object} any data associated with the event
	 * @param type {String} the type of event
	 * @returns {Boolean} Event is only allowed
	 *   if source != dest;
	 */
	function simpleStrategy (source, dest, data, type) {
		return source != dest;
	}

	function configureEventFinder (option) {
		if (typeof option == 'function') return option;

		return function (name) { return eventNames.hasOwnProperty(name); };
	}

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(); }
));