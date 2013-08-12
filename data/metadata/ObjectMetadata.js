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

	var id, objectProxy, patchHandlers, undef;

	id = require('./id');

	objectProxy = {
		get: getProperty,
		set: setProperty,
		has: hasProperty,
		delete: deleteProperty,
		create: createObject
	}

	patchHandlers = {
		new: setProperty,
		updated: setProperty,
		deleted: deleteProperty
	};

	function ObjectMetadata(identify) {
		this.model = Object.create(objectProxy);
		this.model.id = id(identify);
	}

	ObjectMetadata.prototype = {
		map: function(object, f) {
			return f(object, this.model);
		},

		diff: function(before) {
			var snapshot = Object.keys(before).reduce(function(snapshot, key) {
				snapshot[key] = before[key];
				return snapshot;
			}, {});

			return function(after) {
				return diffObjects(after, snapshot);
			};
		},

		patch: function(object, changes) {
			if(!changes) {
				return object;
			}

			return changes.reduce(function(object, change) {
				var handler = handlers[change.type];

				if(handler) {
					handler(object, change.name,
						change.object[change.name], identify);
				}

				return object;
			}, object);

		}
	};

	return ObjectMetadata;

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

	function createObject() {
		return {};
	}

	function getProperty(object, property) {
		if(object != null) {
			return object[property];
		}
	}

	function setProperty(object, property, value) {
		if(object != null) {
			object[property] = value;
		}

		return object;
	}

	function hasProperty(object, property) {
		return object && object[property] !== undef;
	}

	function deleteProperty(object, property) {
		delete object[property];
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
