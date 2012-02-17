(function(buster, CollectionAdapter) {

var assert, refute;

assert = buster.assert;
refute = buster.refute;

function fakeCollection() {
	return {
		add: function() {},
		update: function() {},
		remove: function() {}
	};
}

var item = { id: 1 };

buster.testCase('CollectionAdapter', {
	'should make its collection watchable': function() {
		var collection, adapter;

		collection = fakeCollection();
		adapter = new CollectionAdapter(collection);

		assert.typeOf(collection.watch, 'function');
	},

	'canHandle': {

		'should return true for a duck-typed collection': function() {
			assert(CollectionAdapter.canHandle(fakeCollection()));
		},

		'should return false for non-collection': function() {
			var undef;

			refute(CollectionAdapter.canHandle(undef));
			refute(CollectionAdapter.canHandle(null));
			refute(CollectionAdapter.canHandle([]));
			refute(CollectionAdapter.canHandle({ add: 1, update: function() {}, remove: function() {} }));
		}
	},

	'watch': {

		'should register callbacks': function() {
			var watchable, adapter;

			watchable = fakeCollection();
			watchable.watch = this.stub();
			watchable.watch.returns(4);

			adapter = new CollectionAdapter(watchable);

			assert.equals(adapter.watch(1, 2, 3), 4);
			assert.calledWith(watchable.watch, 1, 2, 3);
		}
	},

	'when notified': {
		setUp: function() {
			this.watchable = fakeCollection();
			this.adapter = new CollectionAdapter(this.watchable);

			this.watchable.add = this.stub();
			this.watchable.update = this.stub();
			this.watchable.remove = this.stub();
		},

		'itemAdded': {

			'should add item to its collection': function() {
				this.watchable.add.returns(1);

				assert.equals(this.adapter.itemAdded(item), 1);
				assert.calledOnceWith(this.watchable.add, item);
				refute.called(this.watchable.update);
				refute.called(this.watchable.remove);
			}
		},

		'itemUpdated': {

			'should remove item from its collection': function() {
				this.watchable.update.returns(1);

				assert.equals(this.adapter.itemUpdated(item), 1);
				assert.calledOnceWith(this.watchable.update, item);
				refute.called(this.watchable.add);
				refute.called(this.watchable.remove);
			}
		},

		'itemRemoved': {

			'should remove item from its collection': function() {
				this.watchable.remove.returns(1);

				assert.equals(this.adapter.itemRemoved(item), 1);
				assert.calledOnceWith(this.watchable.remove, item);
				refute.called(this.watchable.add);
				refute.called(this.watchable.update);
			}
		}

	}

})
})(
	require('buster'),
	require('../CollectionAdapter')
);
