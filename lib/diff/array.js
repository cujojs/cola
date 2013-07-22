(function(define) {
define(function() {

	return function(id, snapshotItem) {

		return function(before) {

			var snapshot = before.reduce(function(snapshots, item, index) {
				var s = snapshots[id(item)] = {
					item: item,
					index: index
				};

				if(snapshotItem) {
					s.compare = snapshotItem(item);
				}

				return snapshots;
			}, {});

			return function(after) {
				return diffArrays(id, snapshot, after);
			};
		};

	};

	function diffArrays(id, a1Snapshot, a2) {
		var seenIds, changes;

		seenIds = {};

		changes = a2.reduce(function (changes, item, index) {
			var s, diff, itemId;
			itemId = id(item);

			if (itemId in a1Snapshot) {
				// Changed items
				s = a1Snapshot[itemId];

				if (s && s.compare) {
					// Deep compare if possible
					diff = s.compare(item);
					if (diff) {
						changes.push({
							type: 'updated',
							object: a2,
							name: index,
							changes: diff
						});
					}
				} else if (s.item !== item) {
					// Shallow compare
					// Different object with the same id
					changes.push({
						type: 'updated',
						object: a2,
						name: index,
						oldValue: s.item
					});
				}
				seenIds[itemId] = 1;
			} else {
				// Newly added items
				changes.push({
					type: 'new',
					object: a2,
					name: index
				});
			}

			return changes;
		}, []);

		changes = Object.keys(a1Snapshot).reduce(function (changes, key) {
			var s;
			if (!(key in seenIds)) {
				// Removed items
				s = a1Snapshot[key];
				changes.push({
					type: 'deleted',
					object: a2,
					name: s.index,
					oldValue: s.item
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
