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
			this.add = itemAdded;
			this.update = itemUpdated;
			this.remove = itemRemoved;
		}
	}
}

var item = { id: 1 };

buster.testCase('CollectionMediator', {

	'forwarding': {

		setUp: function() {
			function setupMockAdapter(spies) {
				var ma = mockAdapter();
				ma.itemAdded   = spies.spy();
				ma.itemUpdated = spies.spy();
				ma.itemRemoved = spies.spy();

				return ma;
			}
			this.adapter1 = setupMockAdapter(this);
			this.adapter2 = setupMockAdapter(this);
		},

		'should forward itemAdded from adapter1 to adapter2': function() {
			createCollectionMediator(this.adapter1, this.adapter2);

			this.adapter1.add(item);

			assert.calledOnceWith(this.adapter2.itemAdded, item);
			refute.called(this.adapter2.itemUpdated);
			refute.called(this.adapter2.itemRemoved);
		},

		'should forward itemAdded from adapter2 to adapter1': function() {
			createCollectionMediator(this.adapter1, this.adapter2);

			this.adapter2.add(item);

			assert.calledOnceWith(this.adapter1.itemAdded, item);
			refute.called(this.adapter1.itemUpdated);
			refute.called(this.adapter1.itemRemoved);
		},

		'should forward itemUpdated from adapter1 to adapter2': function() {
			createCollectionMediator(this.adapter1, this.adapter2);

			this.adapter1.update(item);

			assert.calledOnceWith(this.adapter2.itemUpdated, item);
			refute.called(this.adapter2.itemAdded);
			refute.called(this.adapter2.itemRemoved);
		},

		'should forward itemUpdated from adapter2 to adapter1': function() {
			createCollectionMediator(this.adapter1, this.adapter2);

			this.adapter2.update(item);

			assert.calledOnceWith(this.adapter1.itemUpdated, item);
			refute.called(this.adapter1.itemAdded);
			refute.called(this.adapter1.itemRemoved);
		},

		'should forward itemRemoved from adapter1 to adapter2': function() {
			createCollectionMediator(this.adapter1, this.adapter2);

			this.adapter1.remove(item);

			assert.calledOnceWith(this.adapter2.itemRemoved, item);
			refute.called(this.adapter2.itemAdded);
			refute.called(this.adapter2.itemUpdated);
		},

		'should forward itemRemoved from adapter2 to adapter1': function() {
			createCollectionMediator(this.adapter1, this.adapter2);

			this.adapter2.remove(item);

			assert.calledOnceWith(this.adapter1.itemRemoved, item);
			refute.called(this.adapter1.itemAdded);
			refute.called(this.adapter1.itemUpdated);
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
