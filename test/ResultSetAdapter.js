(function(buster, when, delay, ResultSetAdapter) {

	var assert, refute, promise, undef;

	assert = buster.assert;
	refute = buster.refute;

	function promiseFor(array) {
		return delay(array, 0);
	}

	buster.testCase('ResultSetAdapter', {

		'canHandle': {
			'should return true for an Array': function() {
				assert(ResultSetAdapter.canHandle([]));
			},

			'should return true for a promise': function() {
				assert(ResultSetAdapter.canHandle(when.defer().promise));
			},

			'should return false for a non-Array': function() {
				refute(ResultSetAdapter.canHandle(null));
				refute(ResultSetAdapter.canHandle(undef));
				refute(ResultSetAdapter.canHandle(0));
				refute(ResultSetAdapter.canHandle(true));
				refute(ResultSetAdapter.canHandle({ length: 1 }));
			}
		},

		'forEach': {

			'should iterate over all items': function(done) {
				var src, forEachSpy;

				src = new ResultSetAdapter(promiseFor([
					{ id: 1 }, { id: 2 }
				]));

				forEachSpy = this.spy();

				src.forEach(forEachSpy).then(function() {
					assert.calledTwice(forEachSpy);
					assert.calledWith(forEachSpy, { id: 1 });
					assert.calledWith(forEachSpy, { id: 2 });
					done();
				});
			}

		},

		'add': {

			'should add new items': function(done) {
				var pa, spy;

				pa = new ResultSetAdapter(promiseFor([
					{ id: 1 }
				]));

				spy = this.spy();

				when(pa.add({ id: 2 }),
					function() {
						return pa.forEach(spy);
					}
				).then(
					function() {
						assert.calledTwice(spy);
					}
				).then(done, done);
			},

			'should allow adding an item that already exists': function(done) {
				var pa, spy;

				pa = new ResultSetAdapter(promiseFor([
					{ id: 1 }
				]));

				spy = this.spy();

				when(pa.add({ id: 1 }),
					function() {
						return pa.forEach(spy);
					}
				).then(
					function() {
						assert.calledOnce(spy);
					}
				).then(done, done);
			}

		},

		'remove': {

			'should remove items': function(done) {
				var pa, spy;

				pa = new ResultSetAdapter(promiseFor([
					{ id: 1 }, { id: 2 }
				]));

				spy = this.spy();

				when(pa.remove({ id: 2 }),
					function() {
						return pa.forEach(spy);
					}
				).then(
					function() {
						assert.calledOnce(spy);
					}
				).then(done, done);
			},

			'should allow removing non-existent items': function(done) {
				var pa, spy;

				pa = new ResultSetAdapter(promiseFor([]));

				spy = this.spy();

				when(pa.remove({ id: 2 }),
					function() {
						return pa.forEach(spy);
					}
				).then(
					function() {
						refute.calledOnce(spy);
					}
				).then(done, done);

			}
		},

		'update': {
			'should update items': function(done) {
				var pa, spy, expected;

				pa = new ResultSetAdapter(promiseFor([
					{ id: 1, success: false }
				]));

				spy = this.spy();

				expected = { id: 1, success: true };

				when(pa.update(expected),
					function() {
						return pa.forEach(spy);
					}
				).then(
					function() {
						assert.calledOnceWith(spy, expected);
					}
				).then(done, done);
			},

			'should ignore updates to non-existent items': function(done) {
				var pa, spy, expected;

				expected = { id: 1, success: true };
				pa = new ResultSetAdapter(promiseFor([
					expected
				]));

				spy = this.spy();


				when(pa.update({ id: 2, success: false }),
					function() {
						return pa.forEach(spy);
					}
				).then(
					function() {
						assert.calledOnceWith(spy, expected);
					}
				).then(done, done);
			}
		},

		'clear': {
			'should remove all items': function(done) {
				var src, forEachSpy;

				src = new ResultSetAdapter(promiseFor([
					{ id: 1 }, { id: 2 }
				]));

				forEachSpy = this.spy();

				when(src.clear(),
					function() {
						return src.forEach(forEachSpy);
					}
				).then(
					function() {
						refute.called(forEachSpy);
					}
				).then(done, done);
			}
		}


	});
})(
	require('buster'),
	require('when'),
	require('when/delay'),
	require('../ResultSetAdapter.js')
);