(function (buster, require) {

var assert, refute;
	assert = buster.assert;
refute = buster.refute;

var updateAfterItemChange = require('../../../network/strategy/updateAfterItemChange'),
	mockApi = {
		isPropagating: function () { return true; }
	},
	badApi = {
		isPropagating: function () { return false; }
	},
	data = { foo: 2 },
	updatedData = { foo: 3 };

buster.testCase('cola/network/strategy/updateAfterItemChange', {

	'should return a function': function () {
		assert.isFunction(updateAfterItemChange());
	},

	'should call hub\'s queueEvent after an "add"': function (done) {
		var qspy, api, dest, src;
		qspy = this.spy();
		api = Object.create(mockApi);
		api.queueEvent = qspy;
		src = {};
		dest = { add: function () { return updatedData; } };

		updateAfterItemChange()(src, dest, data, 'add', api);

		setTimeout(function() {
			assert.calledOnceWith(qspy, dest, updatedData, 'update');
			done();
		}, 0);

	},

	'should not call hub\'s queueEvent if returned value is falsey or empty': function (done) {
		var qspy, api, dest, src;
		qspy = this.spy();
		api = Object.create(mockApi);
		api.queueEvent = qspy;
		src = {};
		dest = {
			add: function () { return {}; },
			update: function () { return false; }
		};

		updateAfterItemChange()(src, dest, data, 'add', api);
		updateAfterItemChange()(src, dest, data, 'update', api);

		setTimeout(function() {
			refute.called(qspy);
			done();
		}, 0);

	},

	'should not call hub\'s queueEvent after a "remove" or other events': function (done) {
		var qspy, api, dest, src;
		qspy = this.spy();
		api = Object.create(mockApi);
		api.queueEvent = qspy;
		src = {};
		dest = {
			remove: function () { return updatedData; },
			collect: function () { return updatedData; },
			submit: function () { return updatedData; }
		};

		updateAfterItemChange()(src, dest, data, 'remove', api);
		updateAfterItemChange()(src, dest, data, 'collect', api);
		updateAfterItemChange()(src, dest, data, 'submit', api);

		setTimeout(function() {
			refute.called(qspy);
			done();
		}, 0);

	},

	'should not do anything during "before" or "after" phases': function (done) {
		var qspy, api, dest, src;
		qspy = this.spy();
		api = Object.create(badApi);
		api.queueEvent = qspy;
		src = {};
		dest = { add: qspy };

		updateAfterItemChange()(src, dest, data, 'add', api);

		setTimeout(function() {
			refute.called(qspy);
			done();
		}, 0);

		data = { foo: 2 };
		updatedData = { foo: 3 };
	}

});

})( require('buster'), require );
