var buster, assert, refute, queue, sentinel;

buster = require('buster');
assert = buster.assert;
refute = buster.refute;

queue = require('../../../lib/observer/queue');

sentinel = {};

buster.testCase('tx/queue', {
	'should execute task': function() {
		var q = queue();

		return q(function() {
			assert(true);
		});
	},

	'should return a promise for successful task result': function() {
		var q = queue();

		return q(function() {
			return sentinel;
		}).then(function(x) {
			assert.same(x, sentinel);
		});
	},

	'should return a promise for failed task error': function() {
		var q = queue();

		return q(function() {
			throw sentinel;
		}).then(null, function(x) {
			assert.same(x, sentinel);
		});
	},

	'should execute task if previous task succeeds': function() {
		var q, result;

		q = queue();

		q(function() { result = sentinel; });

		return q(function() {
			assert.same(result, sentinel);
		});
	},

	'should execute task if previous task fails': function() {
		var q, result;

		q = queue();

		q(function() { result = sentinel; throw new Error(); });

		return q(function() {
			assert.same(result, sentinel);
		});
	}
});