(function(buster, when, delay, ResultAdapter) {
	var assert, refute, fail, promise, undef;

	assert = buster.assert;
	refute = buster.refute;
	fail = buster.assertions.fail;

	function promiseFor(it) {
		return delay(it, 0);
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

		'update': {
			'should update an object': function (done) {
				var obj, adapted;
				obj = { first: 'Fred', last: 'Flintstone' };
				adapted = new ResultAdapter(obj);
				when(adapted.update({ first: 'Donna', last: 'Summer' }),
					function(updated) {
						assert.equals(adapted._obj.first, 'Donna');
						assert.equals(adapted._obj.last, 'Summer');
						assert.equals(adapted._obj, updated);
					},
					fail
				).then(done, done);
			},

			'should update supplied properties when called with a partial': function (done) {
				var obj, adapted;
				obj = { first: 'Fred', last: 'Flintstone' };
				adapted = new ResultAdapter(obj);
				when(adapted.update({ last: 'Astaire' }),
					function(updated) {
						assert.equals(adapted._obj.first, 'Fred');
						assert.equals(adapted._obj.last, 'Astaire');
						assert.equals(adapted._obj, updated);
					},
					fail
				).then(done, done);
			}
		}
	});

})(
	require('buster'),
	require('when'),
	require('when/delay'),
	require('../ResultAdapter.js')
);