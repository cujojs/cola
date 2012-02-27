(function(buster, ResultSetAdapter) {

	var assert, refute, promise, undef;

	assert = buster.assert;
	refute = buster.refute;
	promise = buster.promise;

	function promiseFor(array) {
		var p = promise.create();
		setTimeout(function() {
			p.resolve(array);
		}, 0);
		return p;
	}

	buster.testCase('ResultSetAdapter', {

		'canHandle': {
			'should return true for an Array': function() {
				assert(ResultSetAdapter.canHandle([]));
			},

			'should return true for a promise': function() {
				assert(ResultSetAdapter.canHandle(promise.create()));
			},

			'should return false for a non-Array': function() {
				refute(ResultSetAdapter.canHandle(null));
				refute(ResultSetAdapter.canHandle(undef));
				refute(ResultSetAdapter.canHandle(0));
				refute(ResultSetAdapter.canHandle(true));
				refute(ResultSetAdapter.canHandle({ length: 1 }));
			}
		},

		'add': {

			'should add new items': function(done) {
				var pa = new ResultSetAdapter(promiseFor([
					{ id: 1 }
				]));

				pa.watch(function(item) {
					assert.equals(item.id, 2);
					done();
				});

				assert(pa.add({ id: 2 }));
			},

			'should allow adding an item that already exists': function(done) {
				var pa = new ResultSetAdapter(promiseFor([
					{ id: 1 }
				]));

				pa.watch(function() {
					buster.fail();
					done();
				});

				pa.add({ id: 1 }).then(function(result) {
					refute(result);
					done();
				});
			}

		},

		'remove': {

			'should remove items': function(done) {
				var pa = new ResultSetAdapter(promiseFor([
					{ id: 1 }, { id: 2 }
				]));

				pa.watch(null, function(item) {
					assert.equals(item.id, 1);
					done();
				});

				pa.remove({ id: 1 });
			},

			'should allow removing non-existent items': function(done) {
				var pa = new ResultSetAdapter(promiseFor([]));

				pa.watch(null, function() {
					buster.fail();
					done();
				});

				pa.remove({ id: 1 }).then(function(result) {
					refute(result);
					done();
				});
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

		}
	});
})(
	require('buster'),
	require('../ResultSetAdapter.js')
);