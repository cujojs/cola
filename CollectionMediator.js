/** MIT License (c) copyright B Cavalier & J Hann */

(function(define) {
define(function(require) {

	var methodsToForward, ObjectMediator;

	methodsToForward = ['add', 'remove'];

	ObjectMediator = require('./SimpleMediator');

	return function (adapter1, adapter2) {

		var unwatch1, unwatch2, unwatchObjects;

		unwatchObjects = createUnwatcher();
		unwatch1 = initForwarding(adapter1, adapter2, unwatchObjects);
		unwatch2 = initForwarding(adapter2, adapter1, unwatchObjects);

		return function () {
			unwatch1();
			unwatch2();
			unwatchObjects();
		};
	};

	function createForwarder(method) {
		function doForward(target, item, index) {
			var newItem;
			this.forwardTo = noop;
			newItem = target[method](item, index);
			this.forwardTo = doForward;
			return newItem;
		}

		return {
			forwardTo: doForward
		};
	}

	function createCallback(forwarder, to) {
		return function (item, index) {
			var newItem;
			newItem = forwarder.forwardTo(to, item, index);
			// if the forwarded function created a related item, we
			// mediate a relationship with the original item
			if (newItem) {
				forwarder.unwatcher.push(ObjectMediator(item, newItem));
			}
		}
	}

	function initForwarding(from, to, itemUnwatcher) {
		var forwarder, callbacks, i, len;

		callbacks = [];
		for (i = 0, len = methodsToForward.length; i < len; i++) {
			forwarder = createForwarder(methodsToForward[i]);
			forwarder.unwatcher = itemUnwatcher;
			callbacks.push(createCallback(forwarder, to));
		}

		return from.watch.apply(from, callbacks);
	}

	function createUnwatcher() {
		var unwatchers;
		unwatchers = [];
		function unwatchAll() {
			var unwatch;
			while ((unwatch = unwatchers.pop())) unwatch();
		}
		unwatchAll.push = function addUnwatcher(unwatcher) {
			unwatchers.push(unwatcher);
		};
		return unwatchAll;
	}

	function noop() {}

});
}(
	typeof define == 'function'
		? define
		: function(factory) { module.exports = factory(require); }
));
