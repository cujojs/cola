(function (buster, require) {

var assert, refute;
	assert = buster.assert;
refute = buster.refute;

var syncAfterJoin = require('../../../network/strategy/syncAfterJoin'),
	mockApi = {
		isAfter: function () { return true; }
	};

buster.testCase('cola/network/strategy/syncAfterJoin', {

	'should return function that returns false': function () {
		assert.isFunction(syncAfterJoin([]));
		refute(syncAfterJoin([])());
	},

	'should call hub\'s queueEvent': function (done) {
		var qspy, api, dest, src;
		qspy = this.spy();
		api = Object.create(mockApi);
		api.queueEvent = qspy;
		src = {};

		syncAfterJoin()(src, dest, {}, 'join', api);

		setTimeout(function() {
			assert.calledOnceWith(qspy, src, false, 'sync');
			done();
		}, 0);

	},

	'should call hub\'s queueEvent when provide is true': function (done) {
		var qspy, api, dest, src;
		qspy = this.spy();
		api = Object.create(mockApi);
		api.queueEvent = qspy;
		src = {
			provide: true
		};

		// add provider option and test for true data param

		syncAfterJoin()(src, dest, {}, 'join', api);

		setTimeout(function() {
			// Ensure that it was called twice, *and* at least one of
			// those was called with these args
			assert.calledOnceWith(qspy, src, true, 'sync');
			done();
		}, 0);

	},

	'should assume source is provider if data is present': function () {
		var qspy, api, dest, src;
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
