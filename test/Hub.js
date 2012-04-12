(function (buster, require) {

var assert, refute, undef;

assert = buster.assert;
refute = buster.refute;

var Hub = require('cola/Hub');

buster.testCase('cola/Hub', {

	'// should do something': function () {
		assert(false);
	}

});
})( require('buster'), require );
