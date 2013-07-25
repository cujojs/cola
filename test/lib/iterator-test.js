(function(buster, require) {

var assert, refute, fail, gent;

assert = buster.assert;
refute = buster.refute;
fail = buster.assertions.fail;

gent = require('gent');

var iterator = require('../../lib/iterator');

buster.testCase('lib/iterator', {

	iterator: {
		'should throw for primitives': function() {
			assert.claim(function(x) {
				try {
					iterator(x);
					return false;
				} catch(e) {
					return true;
				}
			}, gent.pick([gent.number(), gent.bool(), {}, function(){}]));
		},

		'should return input for iterator': function() {
			var iter = { next: function(){} };
			assert.same(iterator(iter), iter);
		},

		'should return iterator for iterable': function() {
			var iter = {};
			var iterable = { iterator: function(){ return iter; } };
			assert.same(iterator(iterable), iter);
		},

		'should return iterator for array-like': function() {
			assert.claim(function(x) {
				return typeof iterator(x).next === 'function';
			}, gent.pick([gent.string(), gent.array(), gent.object.template({ length: gent.integer() })]));
		}

	}

});

})(require('buster'), require);
