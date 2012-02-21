(function(buster, createCollectionMediator) {

var assert, refute;

assert = buster.assert;
refute = buster.refute;

/**
 * Create a mock collection adapter that has add(), update(), and
 * remove() methods that forcibly invoke the watch callbacks
 */
function mockAdapter() {
	return {
		watch: function(itemAdded, itemUpdated, itemRemoved) {
			this._itemAdded = itemAdded;
			this._itemUpdated = itemUpdated;
			this._itemRemoved = itemRemoved;
		},
		itemAdded: function(item) {
			return this._itemAdded(item);
		},
		itemUpdated: function(item) {
			return this._itemUpdated(item);
		},
		itemRemoved: function(item) {
			return this._itemRemoved(item);
		}
	}
}

var item = { id: 1 };

buster.testCase('CollectionMediator', {

	'forwarding': {

		setUp: function() {
			function setupMockAdapter(spies) {
				var ma = {
					watch: function() {}
				};
				ma.itemAdded   = spies.spy();
				ma.itemUpdated = spies.spy();
				ma.itemRemoved = spies.spy();

				return ma;
			}
			this.sendingAdapter = mockAdapter();
			this.receivingAdapter = setupMockAdapter(this);
		},

		'should forward itemAdded from sender to receiver': function() {
			createCollectionMediator(this.sendingAdapter, this.receivingAdapter);

			this.sendingAdapter.itemAdded(item);

			assert.calledOnceWith(this.receivingAdapter.itemAdded, item);
			refute.called(this.receivingAdapter.itemUpdated);
			refute.called(this.receivingAdapter.itemRemoved);
		},

		'should forward itemAdded from sender to receiver reversed': function() {
			createCollectionMediator(this.receivingAdapter, this.sendingAdapter);

			this.sendingAdapter.itemAdded(item);

			assert.calledOnceWith(this.receivingAdapter.itemAdded, item);
			refute.called(this.receivingAdapter.itemUpdated);
			refute.called(this.receivingAdapter.itemRemoved);
		},

		'should forward itemUpdated from sendingAdapter to receivingAdapter': function() {
			createCollectionMediator(this.sendingAdapter, this.receivingAdapter);

			this.sendingAdapter.itemUpdated(item);

			assert.calledOnceWith(this.receivingAdapter.itemUpdated, item);
			refute.called(this.receivingAdapter.itemAdded);
			refute.called(this.receivingAdapter.itemRemoved);
		},

		'should forward itemUpdated from sendingAdapter to receivingAdapter reversed': function() {
			createCollectionMediator(this.receivingAdapter, this.sendingAdapter);

			this.sendingAdapter.itemUpdated(item);

			assert.calledOnceWith(this.receivingAdapter.itemUpdated, item);
			refute.called(this.receivingAdapter.itemAdded);
			refute.called(this.receivingAdapter.itemRemoved);
		},

		'should forward itemRemoved from sendingAdapter to receivingAdapter': function() {
			createCollectionMediator(this.sendingAdapter, this.receivingAdapter);

			this.sendingAdapter.itemRemoved(item);

			assert.calledOnceWith(this.receivingAdapter.itemRemoved, item);
			refute.called(this.receivingAdapter.itemAdded);
			refute.called(this.receivingAdapter.itemUpdated);
		},

		'should forward itemRemoved from sendingAdapter to receivingAdapter reversed': function() {
			createCollectionMediator(this.receivingAdapter, this.sendingAdapter);

			this.sendingAdapter.itemRemoved(item);

			assert.calledOnceWith(this.receivingAdapter.itemRemoved, item);
			refute.called(this.receivingAdapter.itemAdded);
			refute.called(this.receivingAdapter.itemUpdated);
		}
	},

	'cycle prevention': {
		setUp: function() {

		},

		'// should not allow cycles when forwarding itemAdded': function() {

		},

		'// should not allow cycles when forwarding itemUpdated': function() {

		},

		'// should not allow cycles when forwarding itemRemoved': function() {

		}

	}

});

})(
	require('buster'),
	require('../CollectionMediator')
);
