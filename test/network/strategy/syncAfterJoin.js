(function (buster, require) {

var assert, refute, undef;

assert = buster.assert;
refute = buster.refute;

var syncAfterJoin = require('cola/network/strategy/syncAfterJoin'),
	mockApi = {
		isAfter: function () { return true; }
	};

buster.testCase('cola/network/strategy/syncAfterJoin', {

	'should return function that returns false': function () {
		assert.isFunction(syncAfterJoin([]));
		refute(syncAfterJoin([])());
	},
	'should call hub\'s queueEvent': function () {
		var qspy, api, dest, src, options;
		qspy = this.spy();
		api = Object.create(mockApi);
		api.queueEvent = qspy;
		src = {
			getOptions: function () { return options; }
		};
		options = {};

		syncAfterJoin()(src, dest, {}, 'join', api);

		assert.calledOnce(qspy);
		assert.calledOnceWith(qspy, src, false, 'sync');

		// add provider option and test for true data param

		options.provide = true;
		syncAfterJoin()(src, dest, {}, 'join', api);

		assert.calledTwice(qspy);
		assert.calledWith(qspy, src, true, 'sync');
	},
	'should assume source is provider if data is present': function () {
		var qspy, api, dest, src, options;
		qspy = this.spy();
		api = Object.create(mockApi);
		api.queueEvent = qspy;
		src = {
			forEach: function (lambda) { lambda(1); }
		};

		syncAfterJoin()(src, dest, {}, 'join', api);

		assert.calledOnce(qspy);
		assert.calledWith(qspy, src, true, 'sync');
	}

});
})( require('buster'), require );
