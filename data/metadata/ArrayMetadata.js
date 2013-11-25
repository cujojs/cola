/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author: Brian Cavalier
 * @author: John Hann
 */

(function(define) { 'use strict';
define(function(require) {

	var ArrayIndex, removed, patchHandlers;

    ArrayIndex = require('./ArrayIndex');

	// marker for mark-and-sweep array item removal
	removed = {};

	// handlers for patch operation types
	patchHandlers = {
		new: function (array, index, item, id, identify) {
			var existing = array[index];
			if (!(existing && identify(existing) === id)) {
				array[index] = item;
			}
		},
		updated: function (array, index, item, id, identify) {
            var existing = array[index];
            if (existing && identify(existing) === id) {
                array[index] = item;
            }
		},
		deleted: function (array, index) {
			array[index] = removed;
		}
	};

	/**
	 * Create metadata for an array of data items
	 * @param {object} itemProxy proxy with id, get, and set for
	 *  items in the array
	 * @param {function?} diffItem diffing function for items in the array
	 * @constructor
	 */
	function ArrayMetadata(itemMetadata) {
		this.model = itemMetadata.model;
		this.modelMetadata = itemMetadata;
	}

	ArrayMetadata.prototype = {
		/**
		 * Creates a snapshot of an array, returns a function that
		 * accepts another array which will be diff'd against the
		 * snapshot.
		 * @param {array} before array to snapshot
		 * @returns {function} function that accepts another array
		 *  to be diff'd against the before array, and returns an array
		 *  of changes in Object.observer format.
		 */
		diff: function(before) {
			var id, modelMeta;

			modelMeta = this.modelMetadata;
			id = modelMeta.model.id;

			var snapshot = before.reduce(function(snapshots, item, index) {
				var s = snapshots[id(item)] = {
					item: item,
					index: index
				};

				if(modelMeta.diff) {
					s.compare = modelMeta.diff(item);
				}

				return snapshots;
			}, {});

			return function(after) {
				return diffArrays(id, snapshot, after);
			};
		},

		/**
		 * Applies a set of changes to the supplied array
		 * @param {array} array array to update in place
		 * @param {array} changes list of diffs in Object.observer format,
		 *  such as those produced by the diff() method above
		 * @returns {*}
		 */
		patch: function(array, changes) {

			if(!changes) {
				return array;
			}

            var identify = this.model.id;
            var index = new ArrayIndex(identify, array);

			return changes.reduce(function(array, change) {
				var handler, item, id;

                handler = patchHandlers[change.type];

				if(handler) {
                    item = change.type === 'deleted' ? change.oldValue : change.object[change.name];
                    id = identify(item);
					handler(array,
                        change.type === 'updated' ? index.find(id) : change.name,
                        item, id, identify);
				}

				return array;
			}, array).filter(notRemoved);
		}
	};

	return ArrayMetadata;

	/**
	 * Filters items marked for removal
	 * @param item
	 * @returns {boolean}
	 */
	function notRemoved(item) {
		return item !== removed;
	}

	/**
	 * computes a list of changes, in Object.observe format, between
	 * a1 and a2, given a snapshot of a1
	 * @param {function} id used to generate an identity key for items in a2
	 * @param {object} a1Snapshot snapshot of a1
	 * @param {array} a2 array to be diff'd against a1Snapshot
	 * @returns {array} array of changes in Object.observer format
	 */
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
							changes: diff,
							oldValue: s.item
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

		return changes;
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
