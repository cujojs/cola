(function (define, global) {
define(function () {
"use strict";

	var watchNode, fireSimpleEvent, allUnwatches;

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

	if (has('dom-addeventlistener')) {
		// standard way
		watchNode = function (node, name, callback) {
			node.addEventListener(name, callback, false);
			return function () {
				node && node.removeEventListener(name, callback, false);
			}
		};
	}
	else {
		// try IE way
		watchNode = function (node, name, callback) {
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

	if(has('dom-createevent')) {
		fireSimpleEvent = function (node, type, data) {
			// don't bubble since most form events don't anyways
			var evt = document.createEvent('HTMLEvents');
			evt.initEvent(type, false, true);
			evt.data = data;
			node.dispatchEvent(evt);
		}
	}
	else {
		fireSimpleEvent = function (node, type, data) {
			var evt = document.createEventObject();
			evt.data = data;
			node.fireEvent('on' + type, evt);
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