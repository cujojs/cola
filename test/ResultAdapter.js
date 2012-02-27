(function(buster, ResultAdapter) {
	var assert, refute, promise, undef;

	assert = buster.assert;
	refute = buster.refute;
	promise = buster.promise;

	function promiseFor(it) {
		var p = promise.create();
		setTimeout(function() {
			p.resolve(it);
		}, 0);
		return p;
	}

	buster.testCase('ResultAdapter', {

		'options': {
			'should preserve bindings options': function() {
				var bindings, adaptedObject;

				bindings = {};
				adaptedObject = new ResultAdapter(promiseFor({}), {
					bindings: bindings
				});

				assert.equals(adaptedObject.getOptions().bindings, bindings);
			}
		},

		'canHandle': {
			'should return true for an Object': function() {
				assert(ResultAdapter.canHandle({}));
			},

			'should return true for a promise': function() {
				assert(ResultAdapter.canHandle(promiseFor({})));
			},
			
			'should return false for anything other than Object or promise': function() {
				refute(ResultAdapter.canHandle(), 'undefined');
				refute(ResultAdapter.canHandle(null), 'null');
				refute(ResultAdapter.canHandle(function(){}), 'function');
				refute(ResultAdapter.canHandle([]), 'array');
			}
		},

		'set': {
			'should update property': function(done) {
				var adapted;
				adapted = new ResultAdapter(
					promiseFor({ first: 'Fred', last: 'Fintstone' })
				);

				adapted.watch('first', function (name, value) {
					assert.equals(name, 'first');
					assert.equals(value, 'Martha');
					done();
				});

				adapted.set('first', 'Martha');
			}
		},

		'watchAll': {
			'should watch all properties': function(done) {
				var adapted;
				adapted = new ResultAdapter(
					promiseFor({ first: 'Fred', last: 'Fintstone' })
				);

				adapted.watch('*', function (name, value) {
					assert.equals(name, 'first');
					assert.equals(value, 'Martha');
					done();
				});

				adapted.set('first', 'Martha');

			},

			'should watch properties brought into existence by set': function(done) {
				var adapted;
				adapted = new ResultAdapter(
					promiseFor({})
				);

				adapted.watch('*', function (name, value) {
					assert.equals(name, 'first');
					assert.equals(value, 'Martha');
					done();
				});

				adapted.set('first', 'Martha');

			}
		}
	});

})(
	require('buster'),
	require('../ResultAdapter.js')
);