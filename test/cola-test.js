(function(buster, when, cola) {
"use strict";

var assert, refute, fail, refResolver;

assert = buster.assert;
refute = buster.refute;
fail = buster.assertions.fail;

function makeResolver(resolve, reject) {
	return {
		resolve: resolve,
		reject: reject
	}
}

refResolver = {
	isRef: function() { return false; }
};

buster.testCase('cola', {

	'wire plugin': {
		'should return a valid plugin': function() {
			var plugin = cola.wire$plugin(null, null, {});
			assert.isFunction(plugin.facets.bind.ready);
		},

		'should fail if "to" not provided': function(done) {
			var plugin, bind, wire, rejected;

			plugin = cola.wire$plugin(null, null, {});
			bind = plugin.facets.bind.ready;

			wire = this.stub().returns({});
			wire.resolver = refResolver;

			rejected = this.spy();

			bind(makeResolver(function(p) {
				p.then(fail, rejected).then(function() {
					assert.calledOnce(rejected);
				}).then(done, done);
			}), { target: {} }, wire);
		},

		'should wire options': function() {
			var plugin, bind, wire, resolved;

			plugin = cola.wire$plugin(null, null, {});
			bind = plugin.facets.bind.ready;

			wire = this.stub().returns({
				to: { addSource: this.spy() }
			});
			wire.resolver = refResolver;

			resolved = this.spy();

			bind(makeResolver(resolved), { target: {} }, wire);

			assert.calledOnce(wire);
			assert.calledOnce(resolved);
		},

		'should add source': function() {
			var plugin, bind, wire, addSource, target;

			plugin = cola.wire$plugin(null, null, {});
			bind = plugin.facets.bind.ready;

			addSource = this.spy();
			wire = this.stub().returns({
				to: { addSource: addSource }
			});
			wire.resolver = refResolver;

			target = {};
			bind(makeResolver(this.spy()), { target: target }, wire);

			assert.calledOnceWith(addSource, target);
		},

		'should include default comparator if not provided': function() {
			var plugin, bind, wire, resolved, wired;

			plugin = cola.wire$plugin(null, null, {});
			bind = plugin.facets.bind.ready;

			wire = function(s) { wired = s; };
			wire.resolver = refResolver;

			resolved = this.spy();

			bind(makeResolver(resolved), { target: {} }, wire);

			assert.isFunction(wired.comparator);
		}
	}

});
})(
	require('buster'),
	require('when'),
	require('../cola')
);
