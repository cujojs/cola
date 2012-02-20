/** MIT License (c) copyright B Cavalier & J Hann */

(function(define) {
define(function() {

	var methodsToForward = ['add', 'update', 'remove'];

	return function(adapter1, adapter2) {

		var unwatch1, unwatch2;

		unwatch1 = initForwarding(adapter1, adapter2);
		unwatch2 = initForwarding(adapter2, adapter1);

		return function() {
			unwatch1();
			unwatch2();
		};
	};

	function createForwarder(method) {
		function doForward(target, item, index) {
			this.forwardTo = noop;
			target[method](item, index);
			this.forwardTo = doForward;
		}

		return {
			forwardTo: doForward
		};
	}

	function createCallback(forwarder, to) {
		return function(item, index) {
			forwarder.forwardTo(to, item, index);
		}
	}

	function initForwarding(from, to) {
		var forwarder, callbacks, i, len;


		callbacks = [];
		for(i = 0, len = methodsToForward.length; i < len; i++) {
			forwarder = createForwarder(methodsToForward[i]);
			callbacks.push(createCallback(forwarder, to));
		}

		return from.watch.apply(from, callbacks);
	}

	function noop() {}

});
}(
	typeof define == 'function'
		? define
		: function(factory) { module.exports = factory(); }
));
