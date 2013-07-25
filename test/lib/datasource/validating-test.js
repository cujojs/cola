var buster, assert, refute, fail, validating, sentinel;

buster = require('buster');
assert = buster.assert;
refute = buster.refute;
fail = buster.assertions.fail;

validating = require('../../../data/validating');

sentinel = { value: 'sentinel' };

buster.testCase('lib/datasource/validating', {
	update: {
		'should invoke validator': function() {
			var datasource, validator;

			validator = this.spy();
			datasource = validating({
				update: function() {}
			}, validator);

			return datasource.update(sentinel).then(function() {
				assert.calledOnceWith(validator, sentinel);
			});
		},

		'should delegate when validator succeeds': function() {
			var datasource, update, validator, changes;

			validator = this.stub().returns(sentinel);
			update = this.spy();
			changes = [sentinel];

			datasource = validating({
				update: update
			}, validator);

			return datasource.update(changes).then(function() {
				assert.calledOnceWith(update, changes);
			});
		},

		'should not delegate when validator fails': function() {
			var datasource, update, validator;

			validator = this.stub().throws(new Error());
			update = this.spy();

			datasource = validating({
				update: update
			}, validator);

			return datasource.update().then(
				fail,
				function() {
					refute.called(update);
				}
			);
		}
	}
});