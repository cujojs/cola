(function(buster, createCollectionMediator) {
"use strict";
var assert, refute;

assert = buster.assert;
refute = buster.refute;

/**
 * Create a mock collection adapter that has add() and remove()
 * methods that forcibly invoke the watch callbacks
 */
function mockAdapter() {
	return {
		watch: function(add, remove) {
			this.add = add;
			this.remove = remove;
		}
	}
}

var item = { id: 1 };

buster.testCase('CollectionMediator', {

	'forwarding': {

		setUp: function() {
			function setupMockAdapter(spies) {
				var ma = mockAdapter();
				ma.add   = spies.spy();
				ma.remove = spies.spy();

				return ma;
			}
			this.adapter1 = setupMockAdapter(this);
			this.adapter2 = setupMockAdapter(this);
		},

		'should forward add from adapter1 to adapter2': function() {
			createCollectionMediator(this.adapter1, this.adapter2);

			this.adapter1.add(item);

			assert.calledOnceWith(this.adapter2.add, item);
			refute.called(this.adapter2.remove);
		},

		'should forward add from adapter2 to adapter1': function() {
			createCollectionMediator(this.adapter1, this.adapter2);

			this.adapter2.add(item);

			assert.calledOnceWith(this.adapter1.add, item);
			refute.called(this.adapter1.remove);
		},

		'should forward remove from adapter1 to adapter2': function() {
			createCollectionMediator(this.adapter1, this.adapter2);

			this.adapter1.remove(item);

			assert.calledOnceWith(this.adapter2.remove, item);
			refute.called(this.adapter2.add);
		},

		'should forward remove from adapter2 to adapter1': function() {
			createCollectionMediator(this.adapter1, this.adapter2);

			this.adapter2.remove(item);

			assert.calledOnceWith(this.adapter1.remove, item);
			refute.called(this.adapter1.add);
		}
	},

	'cycle prevention': {
		setUp: function() {

		},

		'// should not allow cycles when forwarding add': function() {

		},

		'// should not allow cycles when forwarding itemUpdated': function() {

		},

		'// should not allow cycles when forwarding remove': function() {

		}

	}

});

})(
	require('buster'),
	require('../CollectionMediator')
);
