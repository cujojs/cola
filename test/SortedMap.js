(function(buster, SortedMap) {

var assert, refute, undef;

assert = buster.assert;
refute = buster.refute;

function compareItems (a, b) {
	return a.id - b.id;
}

function compareByLast (a, b) {
	return a.last < b.last ? -1 : a.last > b.last ? 1 : 0;
}

function symbolizeItem (it) {
	return it.id;
}

buster.testCase('SortedMap', {

	'add': {

		'should add new items': function () {
			var hash = new SortedMap(symbolizeItem, compareItems);

			assert.equals(hash.add({ id: 1 }), 0);
			assert.equals(hash.add({ id: 2 }), 1);

			var spy = this.spy();
			hash.forEach(spy);

			assert.calledTwice(spy);
		},

		'should add very large item into last slot': function () {
			var hash = new SortedMap(symbolizeItem, compareItems);

			assert.equals(hash.add({ id: 1 }), 0);
			assert.equals(hash.add({ id: 9 }), 1);
			assert.equals(hash.add({ id: 99 }), 2);
			assert.equals(hash.add({ id: 999 }), 3);

		},

		'should fail silently when adding an item that already exists': function () {
			var hash = new SortedMap(symbolizeItem, compareItems);

			hash.add({ id: 1 });
			refute.defined(hash.add({ id: 1 }));
		}

	},

	'remove': {

		'should remove items': function () {
			var hash = new SortedMap(symbolizeItem, compareItems);

			var items = [
				{ id: 1 },
				{ id: 3 },
				{ id: 4 },
				{ id: 2 }
			];
			hash.add(items[0], 'foo'); // id: 1
			hash.add(items[1], 'bar'); // id: 3
			hash.add(items[2], 'baz'); // id: 4
			hash.add(items[3], 'fot'); // id: 2

			hash.remove({ id: 3 });

			var spy = this.spy();
			hash.forEach(spy);

			assert.calledWith(spy, 'foo', items[0]);
			refute.calledWith(spy, 'bar', items[1]);
			assert.calledWith(spy, 'baz', items[2]);
			assert.calledWith(spy, 'fot', items[3]);

		},

		'should silently fail when removing non-existent items': function () {
			var hash = new SortedMap(symbolizeItem, compareItems);

			hash.add({ id: 1 });
			refute.defined(hash.remove({ id: 2 }));

		}
	},

	'forEach': {

		'should iterate over all items in order': function () {
			var hash = new SortedMap(symbolizeItem, compareByLast);

			hash.add({ id: 1, last: 'Attercop', expected: 2 });
			hash.add({ id: 3, last: 'TomNoddy', expected: 4 });
			hash.add({ id: 4, last: 'Aardvark', expected: 1 });
			hash.add({ id: 2, last: 'Bojangle', expected: 3 });

			var count = 0, prev = 0;

			hash.forEach(function (value, key) {
				count++;
				// cheap test to see if they're in order
				assert.equals(key.expected - prev, 1);
				prev = key.expected;
			});

			assert(count == 4);
		}

	}
});
})(
	require('buster'),
	require('../SortedMap')
);