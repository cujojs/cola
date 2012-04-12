(function (buster, require) {

var assert, refute, undef;

assert = buster.assert;
refute = buster.refute;

var targetFirstItem = require('cola/network/strategy/targetFirstItem');

buster.testCase('targetFirstItem', {

	'should return function': function () {
		assert.isFunction(targetFirstItem([]));
	},
	'should call queueEvent once': function () {
		var qspy, src, data, api, strategy;

		qspy = this.spy();
		src = {};
		data = {};
		api = {
			beforeSending: true,
			queueEvent: qspy
		};

		// call twice:
		strategy = targetFirstItem();
		strategy(src, api.beforeSending, data, 'add', api);
		strategy(src, api.beforeSending, data, 'add', api);

		assert.calledOnceWith(qspy, src, data, 'target');

		// call once again after sync
		qspy = api.queueEvent = this.spy();
		strategy(src, api.beforeSending, data, 'sync', api);
		strategy(src, api.beforeSending, data, 'add', api);
		strategy(src, api.beforeSending, data, 'add', api);

		assert.calledOnceWith(qspy, src, data, 'target');
	}

});
})( require('buster'), require );
