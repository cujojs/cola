(function (define, global) {
define(function (require) {
"use strict";

	var when, doWatchNode, fireSimpleEvent, allUnwatches;

	when = require('when');

	allUnwatches = [];

	function has(feature) {
		var test = has.cache[feature];
		if (typeof test == 'function') {
			// run it now and cache result
			test = (has.cache[feature] = has.cache[feature]());
		}
		return test;
	}

	has.cache = {
		"dom-addeventlistener": function () {
			return document && 'addEventListener' in document || 'addEventListener' in global;
		},
		"dom-createevent": function () {
			return document && 'createEvent' in document;
		}
	};

	/**
	 * Register a callback to be invoked when events with the supplied name
	 * occur on the supplied node.
	 * @param node {Node} DomNode on which to listen for events
	 * @param name {String} name of the event, e.g. "click"
	 * @param callback {Function} event handler function to invoke
	 */
	function watchNode(node, name, callback) {

		// Wrap the callback in a function that records its return value
		// so that async event handlers that return promises can be coordinated
		function handler(e) {
			if(e._colaHandlerResults) {
				e._colaHandlerResults.push(callback(e));
			}
		}

		// Call environment-specific doWatchNode to setup the actual DOM event
		// handler.  See below.
		return doWatchNode(node, name, handler);
	}

	if (has('dom-addeventlistener')) {
		// standard way
		doWatchNode = function (node, name, callback) {
			node.addEventListener(name, callback, false);
			return function () {
				node && node.removeEventListener(name, callback, false);
			}
		};
	}
	else {
		// try IE way
		doWatchNode = function (node, name, callback) {
			var handlerName, unwatch;
			handlerName = 'on' + name;
			node.attachEvent(handlerName, callback);
			unwatch = function () {
				node && node.detachEvent(handlerName, callback);
			};
			// wish there was a way to has("dom-messedup-garbage-colector")
			// we're using inference here, but wth! it's IE 6-8
			allUnwatches.push(unwatch);
			return unwatch;
		};
		// set global unwatcher
		// oh IE, you pile o' wonder
		watchNode(global, 'unload', function () {
			var unwatch;
			while ((unwatch = allUnwatches.pop())) squelchedUnwatch(unwatch);
		})
	}

	/**
	 * Create a promise that will resolve once all callback handlers have
	 * been invoked, and any promises returned by handlers have also resolved.
	 * @param node {Node}
	 * @param type {String}
	 * @param evt {Event}
	 */
	function initEventPromise(node, type, evt) {
		var deferred, unwatch;

		evt._colaHandlerResults = [];

		deferred = when.defer();
		unwatch = doWatchNode(node, type, function(evt) {
			unwatch();
			// TODO: This only works if event handlers are invoked in the
			// order they were registered, which is true for sane browsers.
			// May need a setTimeout here to make IE work correctly.
//			setTimeout(function() {
				when.all(evt._colaHandlerResults, deferred.resolve, deferred.reject);
//			}, 100);
		});

		return deferred.promise;
	}

	if(has('dom-createevent')) {
		fireSimpleEvent = function (node, type, data) {
			// don't bubble since most form events don't anyways
			var promise, evt;

			evt = document.createEvent('HTMLEvents');
			evt.initEvent(type, false, true);
			evt.data = data;

			promise = initEventPromise(node, type, evt);

			// dispatchEvent executes all callbacks synchronously, so you'd think
			// we could just return when.all(evt[eventResultsProp]) after this statement,
			// but we're seeing signs that the browser re-uses or shares this event object,
			// and/or does not guarantee that this event object is the same object as gets
			// passed to all handlers for this particular dispatch.
			// Putting the when.all itself inside an event handler (in initEventPromise
			// above) seems to guarantee that it will resolve the "correct" eventResultsProp
			node.dispatchEvent(evt);

			return promise;
		}
	}
	else {
		fireSimpleEvent = function (node, type, data) {
			var promise, evt;

			evt = document.createEventObject();
			evt.data = data;

			promise = initEventPromise(node, type, evt);

			// FIXME: This does not work for custom event types. Need to use ondataavailable
			// or some other standard event type for IE and manage the handlers ourselves.
			node.fireEvent('on' + type, evt);

			return promise;
		}
	}

	function squelchedUnwatch (unwatch) {
		try { unwatch(); } catch (ex) {}
	}

	return {
		watchNode: watchNode,
		fireSimpleEvent: fireSimpleEvent
	};

});
}(
	typeof define == 'function'
		? define
		: function (factory) { module.exports = factory(require); },
	this
));