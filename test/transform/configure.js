(function(buster, configure) {
"use strict";

var assert, refute;

assert = buster.assert;
refute = buster.refute;

buster.testCase('transform/configure', {
	
	'should return a function': function() {
		assert.typeOf(configure(function() {}), 'function');
	},

	'should not return an inverse when input does not have an inverse': function() {
		refute.defined(configure(function() {}).inverse, 'function');
	},

	'should return an inverse when input has an inverse': function() {
		function t() {}
		t.inverse = function() {};

		assert.typeOf(configure(t).inverse, 'function');
	},

	'should pass all configured parameters through to resulting function': function() {
		var t, c;

		t = this.spy();
		c = configure(t, 1, 2, 3);
		c('a', 'b', 'c');

		assert.calledOnceWith(t, 'a', 'b', 'c', 1, 2, 3);
	},

	'should pass all configured parameters through to resulting inverse': function() {
		function t() {}
		t.inverse = this.spy();

		var c = configure(t, 1, 2, 3);
		c.inverse('a', 'b', 'c');

		assert.calledOnceWith(t.inverse, 'a', 'b', 'c', 1, 2, 3);
	}
});

})(
	require('buster'),
	require('../../transform/configure')
);