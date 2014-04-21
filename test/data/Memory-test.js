var buster = require('buster');

var Memory = require('../../data/Memory');

buster.testCase('data/Memory', {
	diff: {
		'should diff JSON': function() {
			var m = new Memory({ value: 'a' });
			var patch = m.diff({ value: 'b '});

			buster.assert(patch.length > 0);
		}
	}
});