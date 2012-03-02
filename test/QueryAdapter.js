(function(buster, promise, QueryAdapter) {

var assert, refute;

assert = buster.assert;
refute = buster.refute;

function promiseFor(it) {
	var p = promise.create();
	p.resolve(it);
	return p;
}

function createDatasource() {
	return {
		getIdentity: function() {},
		query: function() {},
		add: function() {},
		remove: function() {}
	};
}

buster.testCase('QueryAdapter', {

    'options': {
        'should preserve bindings options': function() {
            var bindings, adaptedObject;

            bindings = {};
            adaptedObject = new QueryAdapter({}, {
                bindings: bindings
            });

            assert.equals(adaptedObject.getOptions().bindings, bindings);
        }
    },

	'query': {
		'should notify with results': function(done) {
			var qa, ds, added, removed;

			ds = this.stub(createDatasource());
			ds.query.returns(promiseFor([{ id: 1 }]));

			added = this.spy();
			removed = this.spy();

			qa = new QueryAdapter(ds);
			qa.watch(added, removed);

			// TODO: Should be able to just return this, but there is an error
			// in buster right now if we do.  When that's fixed, we can remove
			// the done() calls and just return a promise.
			qa.query().then(
				function() {
					assert.calledOnce(ds.query);
					assert.calledOnce(added);
					refute.called(removed);
					done();
				},
				function() {
					buster.fail();
					done();
				}
			);
		}
	},

	'add': {
		'should add item to datasource': function(done) {
			var ds, qa, item;

			ds = this.stub(createDatasource());

			qa = new QueryAdapter(ds);

			item = { id: 1 };
			qa.add(item).then(
				function() {
					assert.calledOnceWith(ds.add, item);
					done();
				}
			);
		},

		'// should notify add then remove if adding to datasource fails': function() {

		},

		'// should notify when item has been added': function() {

		}
	},

	'remove': {
		'should remove item from datasource': function(done) {
			var ds, qa, item;

			item = { id: 1 };
			ds = this.stub(createDatasource());
			ds.query.returns([item]);

			qa = new QueryAdapter(ds);
			qa.query();

			qa.remove(item).then(
				function() {
					assert.calledOnceWith(ds.remove, item);
					done();
				}
			);

		},

		'// should notify remove then add if removing from datasource fails': function() {

		},

		'// should notify when item has been removed': function() {

		}
	},

	'forEach': {
		'should iterate over empty results before query': function() {
			var qa, spy;

			qa = new QueryAdapter();
			spy = this.spy();

			qa.forEach(spy);

			refute.called(spy);
		},

		'should iterate when results are available': function(done) {
			var ds, qa, spy;

			ds = this.stub(createDatasource());
			ds.query.returns(promiseFor([{ id: 1 }]));

			qa = new QueryAdapter(ds);
			spy = this.spy();

			qa.query();

			qa.forEach(spy).then(function() {
				assert.calledOnce(spy);
				done();
			});

		}
	}

});

})(
    require('buster'),
    require('buster-promise'),
    require('../QueryAdapter.js')
);