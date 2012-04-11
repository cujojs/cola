(function(buster, ArrayAdapter) {

var assert, refute, undef;

assert = buster.assert;
refute = buster.refute;

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

	'forEach': {

		'should iterate over all items': function() {
			var src, forEachSpy;

			src = new ArrayAdapter([
				{ id: 1 }, { id: 2 }
			]);

			forEachSpy = this.spy();

			src.forEach(forEachSpy);

			assert.calledTwice(forEachSpy);
			assert.calledWith(forEachSpy, { id: 1 });
			assert.calledWith(forEachSpy, { id: 2 });
		}

	},

	'add': {

		'should add new items': function() {
			var pa = new ArrayAdapter([
				{ id: 1 }
			]);

			pa.add({ id: 2 });

			var spy = this.spy();

			pa.forEach(spy);

			assert.calledTwice(spy);

		},

		'should allow adding an item that already exists': function() {
			var pa = new ArrayAdapter([
				{ id: 1 }
			]);

			var spy = this.spy();

			pa.forEach(spy);

			assert.calledOnce(spy);
		}

	},

	'remove': {

		'should remove items': function() {
			var pa = new ArrayAdapter([
				{ id: 1 }, { id: 2 }
			]);

			pa.remove({ id: 1 });

			var spy = this.spy();

			pa.forEach(spy);

			assert.calledOnce(spy);
		},

		'should allow removing non-existent items': function() {
			var pa = new ArrayAdapter([]);

			var spy = this.spy();

			pa.forEach(spy);

			refute.called(spy);
		}
	},

	'update': {
		'should update items': function() {
			var pa = new ArrayAdapter([
				{ id: 1, success: false }
			]);

			var spy = this.spy();

			pa.update({ id: 1, success: true });

			pa.forEach(spy);

			assert.calledOnceWith(spy, { id: 1, success: true });
		},

		'should ignore updates to non-existent items': function() {
			var pa = new ArrayAdapter([
				{ id: 1, success: true }
			]);

			var spy = this.spy();

			pa.update({ id: 2, success: false });

			pa.forEach(spy);

			assert.calledOnceWith(spy, { id: 1, success: true });
		}
	},

	'clear': {
		'should remove all items': function() {
			var src, forEachSpy;

			src = new ArrayAdapter([
				{ id: 1 }, { id: 2 }
			]);

			forEachSpy = this.spy();

			src.clear();
			src.forEach(forEachSpy);

			refute.called(forEachSpy);
		}
	}
});
})(
	require('buster'),
	require('../ArrayAdapter.js')
);