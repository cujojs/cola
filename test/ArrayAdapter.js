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

	'add': {

		'should add new items': function() {
			var pa = new ArrayAdapter([
				{ id: 1 }
			], idComparator);

			pa.watch(function(item) {
				assert.equals(item.id, 2);
			});

			pa.add({ id: 2 });
		},

		'should throw when adding an item that already exists': function() {
			var pa = new ArrayAdapter([
				{ id: 1 }
			], idComparator);

			assert.exception(function() {
				pa.add({ id: 1 });
			}, 'Error');
		}

	},

	'remove': {

		'should remove items': function(done) {
			var pa = new ArrayAdapter([
				{ id: 1 }, { id: 2 }
			], idComparator);

			pa.watch(null, function(item) {
				assert.equals(item.id, 1);
				done();
			});

			pa.remove({ id: 1 });
		}
	},

	'forEach': {

		'should propagate all items from source to destination adapter': function() {
			var src, dst, itemAdded;

			src = new ArrayAdapter([
				{ id: 1 }, { id: 2 }
			], idComparator);

			itemAdded = this.spy();

			dst = new ArrayAdapter();
			dst.watch(itemAdded, null);

			src.forEach(function (item) {
				dst.add(item);
			});

			assert.calledTwice(itemAdded);
			assert.calledWith(itemAdded, { id: 1 });
			assert.calledWith(itemAdded, { id: 2 });
		}

	}
});
})(
	require('buster'),
	require('../ArrayAdapter.js')
);