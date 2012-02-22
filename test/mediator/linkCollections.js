(function(buster, linkCollections) {
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
		syncTo: function() {},
		watch: function(add, remove) {
			this.add = add;
			this.remove = remove;
		}
	}
}

var item = { id: 1 };

buster.testCase('linkCollections', {

	'forwarding': {

		setUp: function() {
			function setupMockAdapter(spies) {
				var ma = {
					watch: function() {}
				};
				ma.syncTo = spies.spy();
				ma.add    = spies.spy();
				ma.remove = spies.spy();

				return ma;
			}
			this.sendingAdapter = mockAdapter();
			this.receivingAdapter = setupMockAdapter(this);
		},

		'should sync existing items to receiver on creation': function() {
			this.sendingAdapter.syncTo = this.spy();
			linkCollections(this.sendingAdapter, this.receivingAdapter);

			assert.calledOnceWith(this.sendingAdapter.syncTo, this.receivingAdapter);
		},

		'should forward itemAdded from sender to receiver': function() {
			linkCollections(this.sendingAdapter, this.receivingAdapter);

			this.sendingAdapter.add(item);

			assert.calledOnceWith(this.receivingAdapter.add, item);
			refute.called(this.receivingAdapter.remove);
		},

		'should forward itemAdded from sender to receiver reversed': function() {
			linkCollections(this.receivingAdapter, this.sendingAdapter);

			this.sendingAdapter.add(item);

			assert.calledOnceWith(this.receivingAdapter.add, item);
			refute.called(this.receivingAdapter.remove);
		},

		'should forward itemRemoved from sender to receiver': function() {
			linkCollections(this.sendingAdapter, this.receivingAdapter);

			this.sendingAdapter.remove(item);

			assert.calledOnceWith(this.receivingAdapter.remove, item);
			refute.called(this.receivingAdapter.add);
		},

		'should forward itemRemoved from sender to receiver reversed': function() {
			linkCollections(this.receivingAdapter, this.sendingAdapter);

			this.sendingAdapter.remove(item);

			assert.calledOnceWith(this.receivingAdapter.remove, item);
			refute.called(this.receivingAdapter.add);
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
	require('../../mediator/linkCollections')
);
