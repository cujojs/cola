(function (buster, require) {

var assert, refute, compose, undef;

assert = buster.assert;
refute = buster.refute;

compose = require('../../../network/strategy/compose');

buster.testCase('cola/network/strategy/compose', {

	'should return function': function () {
		assert.isFunction(compose([]));
	},
	'should call each of the strategies': function () {
		var strategies;

		strategies = [
			this.spy(),
			this.spy(),
			this.spy()
		];

		compose(strategies)();

		assert.called(strategies[0]);
		assert.called(strategies[1]);
		assert.called(strategies[2]);
	},
	'should call the strategies in order': function () {
		var strategies;

		strategies = [
			this.spy(),
			this.spy(),
			this.spy()
		];

		compose(strategies)();

		assert.callOrder(strategies[0], strategies[1], strategies[2]);
	},
	'should not proceed past strategy that returns false': function () {
		var strategies;

		strategies = [
			this.spy(),
			function () { return false; },
			this.spy()
		];

		refute(compose(strategies)());

		assert.called(strategies[0])
		refute.called(strategies[2]);
	}

});
})( require('buster'), require );
