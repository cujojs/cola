(function(buster, compose) {
"use strict";

var assert, refute;

assert = buster.assert;
refute = buster.refute;

function addOne(x) {
	return x + 1;
}

function addOneWithInverse(x) {
	return addOne(x);
}

addOneWithInverse.inverse = function(x) {
	return x - 1;
};

buster.testCase('transform/compose', {
	'should return identity if no input transforms provided': function() {
		var c = compose();

		assert.equals(1, c(1));
	},

	'should return identity inverse if no input transforms provided': function() {
		var c = compose();

		assert.equals(1, c.inverse(1));
	},

	'should compose a single function': function() {
		var c = compose(addOne);

		assert.equals(1, c(0));
	},

	'should compose a single function with inverse': function() {
		var c = compose(addOneWithInverse);

		assert.equals(0, c.inverse(1));
	},

	'should compose argument list of function': function() {
		var c = compose(addOne, addOne);

		assert.equals(2, c(0));
	},

	'should compose array of function': function() {
		var c = compose([addOne, addOne]);

		assert.equals(2, c(0));
	},

	'should compose mixed argument list and arrays of function': function() {
		var c = compose(addOne, [addOne, addOne], addOne);

		assert.equals(4, c(0));
	},

	'should compose inverse of mixed argument list and arrays of function': function() {
		var c = compose(addOneWithInverse, [addOneWithInverse, addOneWithInverse], addOneWithInverse);

		assert.equals(0, c.inverse(4));
	}

});

})(
	require('buster'),
	require('../../transform/compose')
);