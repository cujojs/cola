(function(buster, PersistentArray) {

var assert, refute;

assert = buster.assert;
refute = buster.refute;

buster.testCase('PersistentArray.get', {
	'should return falsey when empty': function() {
		var pa = new PersistentArray([]);

		refute(pa.get(1));
	},

	'should return items by id when no key function provided': function() {
		var pa = new PersistentArray([
			{ id: 1 }, { id: 2 }, { id: 3 }
		]);

		assert.equals(pa.get(2).id, 2);
	},

	'should return items by key when key function provided': function() {
		function getName(item) {
			return item.name;
		}

		var pa = new PersistentArray([
			{ id: 1, name: 'a' }, { id: 2, name: 'b' }, { id: 3, name: 'c' }
		], getName);

		refute(pa.get(1));
		assert.equals(pa.get('b').name, 'b');
	}
});

buster.testCase('PersistentArray.add', {
	'should add new items which are then get()able by key': function() {
		var pa = new PersistentArray([
			{ id: 1 }
		]);

		assert(pa.add({ id: 2 }));
		assert.equals(pa.get(2).id, 2);
	}
});

buster.testCase('PersistentArray.remove', {
	'should remove items': function() {
		var pa = new PersistentArray([
			{ id: 1 }, { id: 2 }
		]);

		assert(pa.get(1));

		pa.remove(1);

		refute(pa.get(1));
		assert(pa.get(2));
	},

	'should return index of removed items': function() {
		var pa = new PersistentArray([
			{ id: 1 }, { id: 2 }
		]);

		assert.equals(pa.remove(2), 1);
	},

	'should return -1 when removing non-existent item': function() {
		var pa = new PersistentArray([
			{ id: 1 }
		]);

		assert.equals(pa.remove(2), -1);
	}
});

buster.testCase('PersistentArray.update', {
	'should update an item with the same key': function() {
		var pa = new PersistentArray([
			{ id: 1, val: 1 }
		]);

		assert.equals(pa.get(1).val, 1);
		assert.equals(pa.update({ id: 1, val: 2 }), 0);
		assert.equals(pa.get(1).val, 2);
	},

	'should not add or update an item with a non-existent key': function() {
		var pa = new PersistentArray([
			{ id: 1, val: 1 }
		]);

		assert.equals(pa.update({ id: 2, val: 2 }), -1);
		refute(pa.get(2));
		assert.equals(pa.get(1).val, 1);
	}
});

})(
	this.buster || require('buster'),
	this.PersistentArray || require('../PersistentArray')
);