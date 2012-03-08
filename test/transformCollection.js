(function(buster, transformCollection) {
"use strict";

var assert, refute;

assert = buster.assert;
refute = buster.refute;

function createFakeAdapter(data) {
	data = data || [];
	return {
		add: function(item) {
			this.added(item);
		},
		remove: function(item) {
			this.removed(item);
		},
		watch: function(added, removed) {
			this.added = added;
			this.removed = removed;
		},
		forEach: function(f) {
			for(var i = 0, len = data.length; i < len; i++) {
				f(data[i]);
			}
		},
		getOptions: function() {}
	}
}

function addOne(x) {
	return x + 1;
}

function addOneWithInverse(x) {
	return addOne(x);
}

addOneWithInverse.inverse = function(x) {
	return x - 1;
};

buster.testCase('transformCollection', {
	'should throw if no transform provided': function() {
		assert.exception(function() {
			transformCollection(createFakeAdapter());
		});
	},

	'should not modify original adapter': function() {
		var adapter, p, originals;

		originals = {};
		adapter = createFakeAdapter();

		for(p in adapter) {
			originals[p] = adapter[p];
		}

		transformCollection(adapter, addOneWithInverse);
		for(p in adapter) {
			assert.equals(adapter[p], originals[p]);
		}
	},

	'should preserve original comparator': function() {
		var adapter, transformed;

		function comparator(){}

		adapter = createFakeAdapter();
		adapter.comparator = comparator;
		transformed = transformCollection(adapter, addOneWithInverse);

		assert.same(transformed.comparator, comparator);
	},

	'should preserve original symbolizer': function() {
		var adapter, transformed;

		function symbolizer(){}

		adapter = createFakeAdapter();
		adapter.symbolizer = symbolizer;
		transformed = transformCollection(adapter, addOneWithInverse);

		assert.same(transformed.symbolizer, symbolizer);
	},

	'getOptions': {
		'should return original adapter options': function() {
			var adapter, transformed, options;

			options = {};
			adapter = this.stub(createFakeAdapter());
			transformed = transformCollection(adapter, addOneWithInverse);

			adapter.getOptions.returns(options);
			assert.same(transformed.getOptions(), options);
		}
	},

	'forEach': {
		'should delegate with transformed value': function() {
			var adapter, transformed, lambda;

			adapter = createFakeAdapter([1]);
			transformed = transformCollection(adapter, addOne);

			lambda = this.spy();

			transformed.forEach(lambda);

			assert.calledOnceWith(lambda, 2);
		}
	},

	'watch': {
		'should call original': function() {
			var adapter, transformed;

			adapter = this.stub(createFakeAdapter());
			transformed = transformCollection(adapter, addOneWithInverse);

			function noop() {}
			transformed.watch(noop, noop);
			assert.calledOnce(adapter.watch);
			refute.calledOnceWith(adapter.watch, noop, noop);
		},

		'should watch transformed added items': function() {
			var adapter, transformed, addedSpy;

			adapter = createFakeAdapter();
			transformed = transformCollection(adapter, addOneWithInverse);

			addedSpy = this.spy();

			transformed.watch(addedSpy, function(){});
			transformed.add(2);

			assert.calledOnceWith(addedSpy, 2);
		},

		'should notify with transformed item when item added to original adapter': function() {
			var adapter, transformed, addedSpy;

			adapter = createFakeAdapter();
			transformed = transformCollection(adapter, addOneWithInverse);

			addedSpy = this.spy();

			transformed.watch(addedSpy, function(){});
			adapter.add(1);

			assert.calledOnceWith(addedSpy, 2);

		},

		'should watch transformed removed items': function() {
			var adapter, transformed, removedSpy;

			adapter = createFakeAdapter();
			transformed = transformCollection(adapter, addOneWithInverse);

			removedSpy = this.spy();

			transformed.watch(function(){}, removedSpy);
			transformed.remove(2);

			assert.calledOnceWith(removedSpy, 2);
		},

		'should notify with transformed item when item removed from original adapter': function() {
			var adapter, transformed, removedSpy;

			adapter = createFakeAdapter();
			transformed = transformCollection(adapter, addOneWithInverse);

			removedSpy = this.spy();

			transformed.watch(function(){}, removedSpy);
			adapter.remove(1);

			assert.calledOnceWith(removedSpy, 2);
		}

	},

	'add': {
		'should throw if no inverse transform provided': function() {
			var adapter, transformed;

			adapter = createFakeAdapter();
			transformed = transformCollection(adapter, addOne);

			assert.exception(function() {
				transformed.add(1);
			});
		},

		'should call original with inverse transformed item': function() {
			var adapter, transformed;

			adapter = this.stub(createFakeAdapter());
			transformed = transformCollection(adapter, addOneWithInverse);

			transformed.add(1);
			assert.calledOnceWith(adapter.add, 0);
		}
	},

	'remove': {
		'should throw if no inverse transform provided': function() {
			var adapter, transformed;

			adapter = createFakeAdapter();
			transformed = transformCollection(adapter, addOne);

			assert.exception(function() {
				transformed.remove(1);
			});
		},

		'should call original with inverse transformed item': function() {
			var adapter, transformed;

			adapter = this.stub(createFakeAdapter());
			transformed = transformCollection(adapter, addOneWithInverse);

			transformed.remove(1);
			assert.calledOnceWith(adapter.remove, 0);
		}
	}

});

})(
	require('buster'),
	require('../transformCollection')
);