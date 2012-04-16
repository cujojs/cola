(function (buster, require) {

var assert, refute, undef;

assert = buster.assert;
refute = buster.refute;

var Hub = require('../Hub');
var ArrayAdapter = require('../ArrayAdapter');

buster.testCase('cola/Hub', {

	'should not fail if not given any constructor params': function () {
		refute.exception(function () {
			new Hub();
		});
	},
	'should add methods for eventNames': function () {
		var h = new Hub();
		// this isn't a complete list, but proves the mechanism basically works
		assert.isObject(h);
		assert.isFunction(h.add);
		assert.isFunction(h.update);
		assert.isFunction(h.remove);
	},
	'should add events to events api': function () {console.log('start');
		var e = {}, h = new Hub({
			events: e
		});console.log('end');
		// this isn't a complete list, but proves the mechanism basically works
		assert.isObject(e);
		assert.isFunction(e.add);
		assert.isFunction(e.beforeAdd);
		assert.isFunction(e.remove);
		assert.isFunction(e.beforeRemove);
	},
	'should return an adapter when calling addSource with a non-adapter': function () {
		var h = new Hub();
		var a = h.addSource([]);
		// sniff for an adapter
		assert.isObject(a);
		assert.isFunction(a.add);
	},
	'should pass through an adapter when calling addSource with an adapter': function () {
		var h = new Hub();
		var adapter = new ArrayAdapter([], {});
		var a = h.addSource(adapter);
		// sniff for an adapter
		assert.same(a, adapter);
	},
	'should find and add new event types from adapter': function () {
		var e = {}, h = new Hub({
			events: e
		});
		var adapter = new ArrayAdapter([]);
		adapter.crazyNewEvent = function () {};
		var a = h.addSource(adapter, {
			eventNames: function (name) { return /^crazy/.test(name); }
		});
		// check for method on hub api
		assert.isFunction(h.crazyNewEvent);
		// check for event on events api
		assert.isFunction(e.crazyNewEvent);
	},
	'should call strategy to join adapter and add item': function () {
		var strategy = this.spy();
		var e = {};
		e.join = this.spy();
		e.add = this.spy();
		e.beforeAdd = this.spy();
		var h = new Hub({
			strategy: strategy,
			events: e
		});
		var primary = h.addSource([]);

		// strategy should be called to join primary into network
		assert.calledOnce(e.join);

		primary.name = 'primary'; // debug
		primary.add({ id: 1 });

		// event hub event should be called
		assert.calledOnce(e.add);
		assert.calledOnce(e.beforeAdd);
		assert.callOrder(e.beforeAdd, e.add)
	},
	'should not call events if strategy returns false': function () {
		var e = {};
		e.add = this.spy();
		e.beforeAdd = this.spy();
		var h = new Hub({
			strategy: strategy,
			events: e
		});
		var primary = h.addSource([]);
		var isCanceled;

		primary.name = 'primary'; // debug
		primary.add({ id: 1 });

		// event hub add should not be called
		refute.calledOnce(e.add);
		// event hub beforeAdd should be called
		assert.calledOnce(e.beforeAdd);
		// last strategy call should have api.isCanceled() == true;
		assert(isCanceled, 'last event should be canceled');

		function strategy (source, dest, data, type, api) {
			isCanceled = api.isCanceled();
			return false;
		}
	},
	'should run queued event in next turn': function (done) {
		var h = new Hub({ strategy: strategy });
		var primary = h.addSource([]);
		var removeDetected;

		primary.add({ id: 1 });

		// ensure remove hasn't executed yet
		refute.defined(removeDetected);

		setTimeout(function () {
			assert.defined(removeDetected);
			done();
		}, 100);

		function strategy (source, dest, data, type, api) {
			if ('add' == type) {
				api.queueEvent(source, data, 'remove');
			}
			else if ('remove' == type) {
				removeDetected = true;
			}
		}
	},
	'// should add property transforms to adapter': function () {}

});
})( require('buster'), require );
