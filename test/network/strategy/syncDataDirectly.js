(function (buster, require) {

var assert, refute, undef;

assert = buster.assert;
refute = buster.refute;

var syncDataDirectly = require('../../../network/strategy/syncDataDirectly');

var fakeApi = function (phase) {
	return {
		phase: phase,
		isBefore: function () { return this.phase == 'before'; }
	};
};

buster.testCase('cola/network/strategy/syncDataDirectly', {

	'should return a function': function () {
		assert.isFunction(syncDataDirectly());
	},
	'should always return false for a "sync"': function () {
		var strategy = syncDataDirectly();
		assert.equals(false, strategy({}, {}, {}, 'sync', fakeApi('before')));
	},
	'// should do something': function () {
		assert(false);
	}

});
})( require('buster'), require );
