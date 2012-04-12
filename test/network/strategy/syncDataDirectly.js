(function (buster, require) {

var assert, refute, undef;

assert = buster.assert;
refute = buster.refute;

var syncDataDirectly = require('cola/network/strategy/syncDataDirectly');

buster.testCase('cola/network/strategy/syncDataDirectly', {

	'// should do something': function () {
		assert(false);
	}

});
})( require('buster'), require );
