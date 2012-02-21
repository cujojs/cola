(function(buster, ArrayAdapter) {

var assert, refute, undef;

assert = buster.assert;
refute = buster.refute;

function idComparator(a, b) {
	return a.id < b.id ? -1
		: a.id > b.id ? 1
			: 0;
}

buster.testCase('ArrayAdapter', {

	'canHandle': {
		'should return true for an Array': function() {
			assert(ArrayAdapter.canHandle([]));
		},

		'should return false for a non-Array': function() {
			refute(ArrayAdapter.canHandle(null));
			refute(ArrayAdapter.canHandle(undef));
			refute(ArrayAdapter.canHandle(0));
			refute(ArrayAdapter.canHandle(true));
			refute(ArrayAdapter.canHandle({ length: 1 }));
		}
	},

	'itemAdded': {

		'should add new items': function(done) {
			var pa = new ArrayAdapter([
				{ id: 1 }
			], idComparator);

			pa.watch(function(item) {
				assert.equals(item.id, 2);
				done();
			});

			pa.itemAdded({ id: 2 });
		},

		'should throw when adding an item that already exists': function() {
			var pa = new ArrayAdapter([
				{ id: 1 }
			], idComparator);

			assert.exception(function() {
				pa.itemAdded({ id: 1 });
			}, 'Error');
		}

	},

	'itemRemoved': {

		'should remove items': function(done) {
			var pa = new ArrayAdapter([
				{ id: 1 }, { id: 2 }
			], idComparator);

			pa.watch(null, null, function(item) {
				assert.equals(item.id, 1);
				done();
			});

			pa.itemRemoved({ id: 1 });
		}
	},

	'itemUpdate': {

		'should update an item with the same key': function() {
			var pa = new ArrayAdapter([
				{ id: 1, val: 1 }
			], idComparator);

			pa.watch(null, function(item) {
				assert.equals(item.id, 1);
				assert.equals(item.val, 2);
			});

			pa.itemUpdated({ id: 1, val: 2 });
		},

		'should not add or update an item with a non-existent key': function() {
			var pa = new ArrayAdapter([
				{ id: 1, val: 1 }
			], idComparator);

			assert.exception(function() {
				pa.itemUpdated({ id: 2, val: 2 });
			});
		}

	}
});
})(
	require('buster'),
	require('../ArrayAdapter.js')
);