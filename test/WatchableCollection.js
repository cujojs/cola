(function(buster, makeWatchable) {

var assert, refute;

assert = buster.assert;
refute = buster.refute;

buster.testCase('WatchableCollection', {
	setUp: function() {
		// Create spy callbacks we can use as WatchableCollection callbacks
		this.itemAdded   = this.spy();
		this.itemRemoved = this.spy();

		this.collection = {
			add: function(item) {
				if(this.exception) {
					throw new Error();
				}

				return item;
			},

			remove: function(item) {
				if(this.exception) {
					throw new Error();
				}

				return item;
			}

		};

		this.watchable = makeWatchable(this.collection);

		this.removeCallbacks = this.watchable.watch(this.itemAdded, this.itemUpdated, this.itemRemoved);
	},

	'add': {

		'should notify with item when an item is added': function() {
			var item = { id: 1 };

			this.watchable.add(item);

			assert.calledWith(this.itemAdded, item);
			refute.called(this.itemRemoved);
		},

		'should not notify when an existing item is added': function() {
			var item = { id: 1 };
			this.watchable.add(item);

			// The exception doesn't matter here, what matters is that
			// itemAdded/Removed callbacks are not called
			this.collection.exception = true;
			try {
				this.watchable.add(item);
			} catch(e) {}

			assert.calledOnce(this.itemAdded);
			refute.called(this.itemRemoved);
		},

		'should not notify after callbacks are removed': function() {
			var item = { id: 1 };

			this.watchable.add(item);
			assert.calledOnce(this.itemAdded);

			this.removeCallbacks();

			this.watchable.add(item);
			refute.calledTwice(this.itemAdded);
		}

	},

	'remove': {

		'should notify with item when an item is removed': function() {
			var item = { id: 1 };

			this.watchable.remove(item);

			assert.calledWith(this.itemRemoved, item);
			refute.called(this.itemAdded);
		},

		'should not notify after callbacks are removed': function() {
			var item = { id: 1 };

			this.watchable.remove(item);
			assert.calledOnce(this.itemRemoved);

			this.removeCallbacks();

			this.watchable.remove(item);
			refute.calledTwice(this.itemRemoved);
		},

		'should not notify when a non-existent item is removed': function() {
			var item = { id: 1 };

			// The exception doesn't matter here, what matters is that
			// itemAdded/Removed callbacks are not called
			this.collection.exception = true;
			try {
				this.watchable.remove(item);
			} catch(e) {}

			refute.called(this.itemAdded);
			refute.called(this.itemRemoved);
		}

	}
});

})(
	require('buster'),
	require('../WatchableCollection')
);