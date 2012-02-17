(function(buster, makeWatchable) {

var assert, refute;

assert = buster.assert;
refute = buster.refute;

function FakeCollection() {
}

FakeCollection.prototype = {
	add: function() {
		return this.addResult;
	},

	remove: function() {
		return this.removeResult;
	},

	update: function() {
		return this.updateResult;
	}
};

function setUp() {
	// Create spy callbacks we can use as WatchableCollection callbacks
	this.itemAdded   = this.spy();
	this.itemUpdated = this.spy();
	this.itemRemoved = this.spy();

	this.collection = new FakeCollection();
	this.watchable = makeWatchable(this.collection);

	this.removeCallbacks = this.watchable.watch(this.itemAdded, this.itemUpdated, this.itemRemoved);
}

function tearDown() {
	this.removeCallbacks();
}

buster.testCase('WatchableCollection', {
	setUp: setUp,
	tearDown: tearDown,

	'add': {

		'should notify with item and index when an item is added': function() {
			var item = { id: 1 };

			this.collection.addResult = 1;
			this.watchable.add(item);

			assert.calledWith(this.itemAdded, item, 1);
			refute.called(this.itemUpdated);
			refute.called(this.itemRemoved);
		},

		'should not notify after callbacks are removed': function() {
			var item = { id: 1 };

			this.collection.addResult = 1;
			this.watchable.add(item);
			assert.calledOnce(this.itemAdded);

			this.removeCallbacks();

			this.watchable.add(item);
			refute.calledTwice(this.itemAdded);
		}

	},

	'update': {

		'should notify with item and index when an item is updated': function() {
			var item = { id: 1 };

			this.collection.updateResult = 1;
			this.watchable.update(item);

			assert.calledWith(this.itemUpdated, item, 1);
			refute.called(this.itemAdded);
			refute.called(this.itemRemoved);
		},

		'should not notify after callbacks are removed': function() {
			var item = { id: 1 };

			this.collection.updateResult = 1;
			this.watchable.update(item);
			assert.calledOnce(this.itemUpdated);

			this.removeCallbacks();

			this.watchable.update(item);
			refute.calledTwice(this.itemUpdated);
		},

		'should not notify when a non-existent item is updated': function() {
			var item = { id: 1 };

			this.collection.updateResult = -1;
			this.watchable.update(item);

			refute.called(this.itemAdded);
			refute.called(this.itemUpdated);
			refute.called(this.itemRemoved);
		}

	},

	'remove': {

		'should notify with item and index when an item is removed': function() {
			var item = { id: 1 };

			this.collection.removeResult = 1;
			this.watchable.remove(item);

			assert.calledWith(this.itemRemoved, item, 1);
			refute.called(this.itemAdded);
			refute.called(this.itemUpdated);
		},

		'should not notify after callbacks are removed': function() {
			var item = { id: 1 };

			this.collection.removeResult = 1;
			this.watchable.remove(item);
			assert.calledOnce(this.itemRemoved);

			this.removeCallbacks();

			this.watchable.remove(item);
			refute.calledTwice(this.itemRemoved);
		},

		'should not notify when a non-existent item is removed': function() {
			var item = { id: 1 };

			this.collection.removeResult = -1;
			this.watchable.remove(item);

			refute.called(this.itemAdded);
			refute.called(this.itemUpdated);
			refute.called(this.itemRemoved);
		}

	}
});

})(
	require('buster'),
	require('../WatchableCollection')
);