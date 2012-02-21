/** MIT License (c) copyright B Cavalier & J Hann */

(function(define) {
define(function(require) {

	var methodsToForward, ObjectMediator;

	methodsToForward = ['add', 'remove'];

	ObjectMediator = require('./SimpleMediator');

	/**
	 * Sets up mediation between two collection adapters
	 * @param adapter1 {Object} collection adapter
	 * @param adapter2 {Object} collection adapter
	 * @param options {Object} options
	 * @param options.sync {Boolean} whether to immediately synchronize data from
	 *   adapter1 to adapter2.  Default is true
	 */
	return function (adapter1, adapter2, options) {

		var unwatch1, unwatch2, unwatchObjects;

		if(!options) options = {};

		if(!('sync' in options) || options.sync) {
			adapter1.syncTo(adapter2);
		}

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
			this.forwardTo = noop;
			try {
				target[method](item, index);
			} finally {
				this.forwardTo = doForward;
			}
		}

		return {
			forwardTo: doForward
		};
	}

	function createCallback(forwarder, to) {
		return function (item, index) {
			forwarder.forwardTo(to, item, index);
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
