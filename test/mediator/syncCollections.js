(function(buster, syncCollections) {
"use strict";
var assert, refute;

assert = buster.assert;
refute = buster.refute;

/**
 * Create a mock collection adapter that has add() and remove()
 * methods that forcibly invoke the watch callbacks
 */
function mockAdapter() {
	return {
		comparator: null,
		identifier: null,
		forEach: function() {},
		watch: function(add, remove) {
			this.add = add;
			this.remove = remove;
		}
	}
}

var item = { id: 1 };

buster.testCase('syncCollections', {

	'forwarding': {

		setUp: function() {
			function setupMockAdapter(spies) {
				var ma = {
					comparator: null,
					identifier: null,
					watch: function() {}
				};
				ma.forEach = spies.spy();
				ma.add    = spies.spy();
				ma.remove = spies.spy();

				return ma;
			}
			this.sendingAdapter = mockAdapter();
			this.receivingAdapter = setupMockAdapter(this);
		},

		'should sync existing items to receiver on creation': function() {
			this.sendingAdapter.forEach = this.spy();
			syncCollections(this.sendingAdapter, this.receivingAdapter);

			assert.calledOnce(this.sendingAdapter.forEach);
		},

		'should forward itemAdded from sender to receiver': function() {
			syncCollections(this.sendingAdapter, this.receivingAdapter);

			this.sendingAdapter.add(item);

			assert.calledOnceWith(this.receivingAdapter.add, item);
			refute.called(this.receivingAdapter.remove);
		},

		'should forward itemAdded from sender to receiver reversed': function() {
			syncCollections(this.receivingAdapter, this.sendingAdapter);

			this.sendingAdapter.add(item);

			assert.calledOnceWith(this.receivingAdapter.add, item);
			refute.called(this.receivingAdapter.remove);
		},

		'should forward itemRemoved from sender to receiver': function() {
			syncCollections(this.sendingAdapter, this.receivingAdapter);

			this.sendingAdapter.remove(item);

			assert.calledOnceWith(this.receivingAdapter.remove, item);
			refute.called(this.receivingAdapter.add);
		},

		'should forward itemRemoved from sender to receiver reversed': function() {
			syncCollections(this.receivingAdapter, this.sendingAdapter);

			this.sendingAdapter.remove(item);

			assert.calledOnceWith(this.receivingAdapter.remove, item);
			refute.called(this.receivingAdapter.add);
		},

		'should propagate comparator from primary to secondary adapter': function() {
			function f() {}

			this.sendingAdapter.comparator = f;

			syncCollections(this.sendingAdapter, this.receivingAdapter);

			assert.same(this.receivingAdapter.comparator, f);
		},

		'should propagate identifier from primary to secondary adapter': function() {
			function f() {}

			this.sendingAdapter.identifier = f;

			syncCollections(this.sendingAdapter, this.receivingAdapter);

			assert.same(this.receivingAdapter.identifier, f);

		}
	},

	'cycle prevention': {
		setUp: function() {

		},

		'// should not allow cycles when forwarding add': function() {

		},

		'// should not allow cycles when forwarding itemUpdated': function() {

		},

		'// should not allow cycles when forwarding remove': function() {

		}

	}

});

})(
	require('buster'),
	require('../../mediator/syncCollections')
);
