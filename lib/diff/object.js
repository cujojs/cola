(function(define) {
define(function() {

	return function(before) {
		var snapshot = Object.keys(before).reduce(function(snapshot, key) {
			snapshot[key] = before[key];
			return snapshot;
		}, {});

		return function(after) {
			return diffObjects(after, snapshot);
		};
	};

	function diffObjects(o1, o2) {
		var changes = Object.keys(o1).reduce(function (changes, key) {
			if (key in o2) {
				if (o2[key] !== o1[key]) {
					// Property value changed
					changes.push({
						type: 'updated',
						object: o1,
						name: key,
						oldValue: o2[key]
					});
				}
			} else {
				// Property added
				changes.push({
					type: 'new',
					object: o1,
					name: key
				});
			}

			return changes;
		}, []);

		changes = Object.keys(o2).reduce(function (changes, key) {
			if (!(key in o1)) {
				// Property deleted
				changes.push({
					type: 'deleted',
					object: o1,
					name: key,
					oldValue: o2[key]
				});
			}

			return changes;
		}, changes);

		return changes.length
			? changes
			: false;
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));
