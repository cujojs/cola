(function (define) {
define(function (require) {
"use strict";

	var eventNames,
		beforePhase, propagatingPhase, afterPhase, canceledPhase,
		resolver, addPropertyTransforms, simpleStrategy,
		undef;

	// TODO: make these configurable/extensible
	eventNames = {
		// collection item events
		add: 1,
		remove: 1,
		update: 1,
		target: 1,
		// edit mode events
		edit: 1,
		cancel: 1,
		save: 1,
		// multi-item events
		select: 1,
		unselect: 1,
		// network-level events
		join: 1,
		sync: 1,
		leave: 1
	};

	/**
	 * Signal that event has not yet been pushed onto the network.
	 * Return false to prevent the event from being pushed.
	 */
	beforePhase = {};

	/**
	 * Signal that event is currently being propagated to adapters.
	 */
	propagatingPhase = {};

	/**
	 * Signal that an event has already been pushed onto the network.
	 * Return value is ignored since the event has already propagated.
	 */
	afterPhase = {};

	/**
	 * Signal that an event was canceled and not pushed onto the network.
	 * Return value is ignored since the event has already propagated.
	 */
	canceledPhase = {};

	resolver = require('./AdapterResolver');
	addPropertyTransforms = require('./addPropertyTransforms');
	simpleStrategy = require('./network/strategy/default');

	/**
	 * @constructor
	 * @param primary {Object} primary data source
	 * @param options.strategy {strategyFunction} a strategy
	 *   Strategies determine if an event gets onto the network and then how
	 *   it's processed by the other data sources in the network.
	 *   Only one strategy can be applied to a network. However, strategies
	 *   can be composed/combined.
	 * @param [options.eventsHub] {Object} an object to receive events
	 *   from the hub's network
	 *
	 * @description
	 * The hub exposes actions that can be propagated through the network
	 * of data sources.  These actions are the same actions supported by
	 * the adapters that wrap the data sources.  Examples include: add(),
	 * remove(), update(), select(), unselect().  Each action has the same
	 * signature: `function (data, [source]) { return bool; }`  The source
	 * parameter is optional, but may be critical for proper operation of
	 * certain strategies.  Supplying a dom event from a dom node that was
	 * added to a hub (i.e. the dom node is under a NodeListAdapter's
	 * root node) will automatically be translated to the correct data item and
	 * the correct source.
	 */
	function Hub (options) {
		var adapters, eventQueue, strategy, publicApi, eventsApi,
			callPublicEvent;

		// TODO: Determine if we need to save Hub options and mix them into
		// options passed thru to adapters in addSource

		// all adapters in network
		adapters = [];

		// events to be processed (fifo)
		eventQueue = [];

		callPublicEvent = checkEventsApi;

		if (!options) options = {};

		strategy = options.strategy;
		if (!strategy) strategy = simpleStrategy(options.strategyOptions);

		// create public api
		publicApi = {
			addSource: addSource,
			destroy: destroy
		};

		// add standard events to publicApi
		addApiMethods(eventNames);

		// add events
		publicApi.eventsHub = eventsApi = options.eventsHub;
		if (eventsApi) {
			addApiEvents(eventNames);
		}
		else {
			eventsApi = {};
		}

		return publicApi;

		/**
		 * @memberOf Hub
		 * @param source
		 * @param options {Object}
		 * @param [options.eventNames] {Function} function that returns a
		 *   list of method names that should be considered events
		 *   If omitted, all methods, the standard event names are used.
		 * @param options.provide {Boolean} if true, initiates a 'sync' event
		 *   from this source's adapter
		 */
		function addSource (source, options) {
			var Adapter, adapter, proxy, method, eventFinder;

			if (!options) options = {};

			// create an adapter for this source
			// if we can't find an Adapter constructor, it is assumed to be an
			// adapter already.
			// TODO: revisit this assumption?
			// TODO: how to detect whether to use 'collection' or 'object' types
			Adapter = resolver(source, 'collection');
			adapter = Adapter ? new Adapter(source, options) : source;
			if (options.bindings) {
				adapter = addPropertyTransforms(adapter, collectPropertyTransforms(options.bindings));
			}

			proxy = beget(adapter);

			// keep copy of original source so we can match it up later
			proxy.origSource = source;
			proxy.provide = options.provide;

			// sniff for event hooks
			eventFinder = configureEventFinder(options.eventNames);

			// override methods that require event hooks
			for (method in adapter) {
				if (typeof adapter[method] == 'function') {
					if (eventFinder(method)) {
						// store original method on proxy (to stop recursion)
						proxy[method] = adapter[method];
						// change public api of adapter to call back into hub
						observeAdapterMethod(adapter, method, adapter[method]);
						// ensure hub has a public method of the same name
						addApiMethod(method);
						addApiEvent(method);
					}
				}
			}

			// save the proxied adapter
			adapters.push(proxy);

			// TODO: Should we use a boolean for the 2nd param to indicate join vs. leave
			// instead of using separate events?
			// Right now the second param is unused
			processEvent(proxy, null, 'join');

			return adapter;
		}

		function queueEvent (source, data, type) {
			var queueNeedsRestart;

			// if queue length is zero, we need to start processing it again
			queueNeedsRestart = eventQueue.length == 0;

			// enqueue event
			eventQueue.push({ source: source, data: data, type: type });

			// start processing, if necessary
			if (queueNeedsRestart) processNextEvent();
		}

		function processNextEvent () {
			var event;

			// get the next event, if any
			event = eventQueue.shift();

			// if there was an event, process it soon
			if (event) {
				setTimeout(function () {
					processEvent(event.source, event.data, event.type);
				}, 0);
			}
		}

		/*
			1. call eventsHub.beforeXXX(data)
			2. call strategy on each source/dest pair w/ event XXX and data
				- cancel iteration if any strategy returns false for any pair
			3. if not canceled, call eventsHub.XXX(data)
		 */
		function processEvent (source, data, type) {
			var context, strategyApi, i, adapter, canceled;

			// give public api a chance to see (and possibly cancel) event
			canceled = false === callPublicEvent(data, camelize('before', type));

			// if public api cancels, the network never sees the event at all
			if (!canceled) {

				context = { phase: beforePhase };
				strategyApi = createStrategyApi(context);

				canceled = false === strategy(source, undef, data, type, strategyApi);
				i = adapters.length;

				context.phase = propagatingPhase;
				while (!canceled && (adapter = adapters[--i])) {
					if (false === strategy(source, adapter, data, type, strategyApi)) {
						canceled = true;
						break;
					}
				}

				context.phase = canceled ? canceledPhase : afterPhase;
				canceled = false === strategy(source, undef, data, type, strategyApi);

			}

			if (!canceled) callPublicEvent(data, type);

			processNextEvent();

			return canceled;
		}

		function createStrategyApi (context) {
			function isPhase (phase) { return context.phase == phase; }
			return {
				queueEvent: queueEvent,
				isBefore: function () { return isPhase(beforePhase); },
				isAfter: function () { return isPhase(afterPhase); },
				isCanceled: function () { return isPhase(canceledPhase); },
				isPropagating: function () { return isPhase(propagatingPhase); }
			};
		}

		function observeAdapterMethod (adapter, type, origMethod) {
			return adapter[type] = function (data) {
				processEvent(adapter, data, type);
				return origMethod.call(adapter, data);
			};
		}

		function addApiMethods (eventNames) {
			for (var name in eventNames) {
				addApiMethod(name);
			}
		}

		function addApiMethod (name) {
			if (!publicApi[name]) {
				publicApi[name] = function (itemOrDomEvent) {
					var sourceInfo;
					if (isDomEvent(itemOrDomEvent)) {
						sourceInfo = convertFromDomEvent(itemOrDomEvent, adapters);
					}
					else {
						sourceInfo = {
							item: itemOrDomEvent,
							source: findAdapterForSource(arguments[1], adapters)
						};
					}
					return processEvent(sourceInfo.source, sourceInfo.item, name);
				};
			}
		}

		function addApiEvents (eventNames) {
			for (var name in eventNames) {
				addApiEvent(name);
			}
		}

		function addApiEvent (name) {
			// add function stub to api
			if (!eventsApi[name]) {
				eventsApi[name] = function (data) {};
			}
			// add beforeXXX stub, too
			name = camelize('before', name);
			if (!eventsApi[name]) {
				eventsApi[name] = function (data) {};
			}
		}

		function callEventsApi (data, name) {
			// yah, this is simple, but there's some redirection going on
			// see checkEventsApi
			try {
				return eventsApi[name](data);
			}
			catch (ex) {
				return false;
			}
		}

		function checkEventsApi (data, name) {
			var tempApi;

			// once we have an eventsHub, start using it and stop using
			// this function
			if (publicApi.eventsHub) {

				// switch eventsApi to public property
				eventsApi = publicApi.eventsHub;
				tempApi = eventsApi;

				// ensure all events are on new api
				for (var p in tempApi) addApiEvent(p);

				// switch callPublicEvent to normal function
				callPublicEvent = callEventsApi;

				// resume as usual
				callPublicEvent(data, name);
			}
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

	// TODO: get rid of this mess
	resolver.register(require('./ArrayAdapter'), 'collection');
	resolver.register(require('./dom/NodeListAdapter'), 'collection');
	resolver.register(require('./ResultSetAdapter'), 'collection');
	resolver.register(require('./QueryAdapter'), 'collection');
	resolver.register(require('./dom/NodeAdapter'), 'object');
	resolver.register(require('./ObjectAdapter'), 'object');
	resolver.register(require('./ResultAdapter'), 'object');

	return Hub;

	/**
	 * Signature for all network strategy functions.
	 * @param source {Object} the adapter that sourced the event
	 * @param dest {Object} the adapter receiving the event
	 * @param data {Object} any data associated with the event
	 * @param type {String} the type of event
	 * @param api {Object} helpful functions for strategies
	 * @returns {Boolean} whether event is allowed.
	 */
	function strategyFunction (source, dest, data, type, api) {};

	function configureEventFinder (option) {
		if (typeof option == 'function') return option;

		return function (name) { return eventNames.hasOwnProperty(name); };
	}

	function convertFromDomEvent (itemOrEvent, adapters) {
		var item, i, adapter;

		// loop through adapters that have the getItemForEvent() method
		// to try to find out which adapter and which data item
		i = 0;
		while (!item && (adapter = adapters[i++])) {
			if (adapter.getItemForEvent) {
				item = adapter.getItemForEvent(itemOrEvent);
			}
		}

		if (!item) {
			var err = new Error('Hub: could not find data item for dom event.');
			err.event = itemOrEvent; // TODO: is this helpful?
			throw err;
		}

		return { item: item, source: adapter };
	}

	function isDomEvent (e) {
		// using feature sniffing to detect if this is an event object
		return e.target && e.stopPropagation && e.preventDefault;
	}

	function findAdapterForSource (source, adapters) {
		var i, adapter, found;

		// loop through adapters and find which one was created for this source
		i = 0;
		while (!found && (adapter = adapters[i++])) {
			if (adapter.origSource == source) {
				found = adapter;
			}
		}

		return found;
	}

	function collectPropertyTransforms (bindings) {
		var name, propertyTransforms, transform;

		propertyTransforms = {};
		for (name in bindings) {
			transform = bindings[name].transform;
			if (transform) {
				propertyTransforms[name] = transform;
			}
		}

		return propertyTransforms;
	}

	function Begetter () {}
	function beget (proto) {
		var obj;
		Begetter.prototype = proto;
		obj = new Begetter();
		Begetter.prototype = undef;
		return obj;
	}

	function noop () {}

	function camelize (prefix, name) {
		return prefix + name.charAt(0).toUpperCase() + name.substr(1);
	}

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));
