(function(buster, require) {

var assert, refute, fail;

assert = buster.assert;
refute = buster.refute;
fail = buster.assertions.fail;

var comparator = require('../../lib/comparator');

function compare(a, b) {
	return a - b;
}

function lt() { return -1; }
function gt() { return 1; }
function eq() { return 0; }

buster.testCase('lib/comparator', {

	compose: {
		'should return equality for equal items': function() {
			assert.equals(comparator.compose(eq, eq)(), 0);
		},

		'should return -1 for nested less': function() {
			assert.equals(comparator.compose(eq, lt)(), -1);
		},

		'should return 1 for nested less': function() {
			assert.equals(comparator.compose(eq, gt)(), 1);
		},

		'should throw if no comparators provided': function() {
			assert.exception(comparator.compose);
		}
	},

	reverse: {
		'should return equality for equal items': function() {
			assert.equals(comparator.reverse(compare)(1, 1), 0);
		},

		'should return -1 for nested less': function() {
			assert.equals(comparator.reverse(compare)(1, 0), -1);
		},

		'should return 1 for nested less': function() {
			assert.equals(comparator.reverse(compare)(0, 1), 1);
		},

		'should throw if no comparators provided': function() {
			assert.exception(comparator.reverse);
		}
	}

});

})(require('buster'), require);
