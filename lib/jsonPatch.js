/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author Brian Cavalier
 * @author John Hann
 */

(function(define) { 'use strict';
define(function(require) {

	var jsonPointer = require('./jsonPointer');

	var jsonDateRx = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)(Z|([+\-])(\d{2}):(\d{2}))$/;

	var ops = {
		replace: setValue,
		add: setValue,
		remove: remove
	};

	var arrayOps = {
		replace: setValue,
		add: setValue,
		remove: markRemoved
	};

	var removed = {};

	return {
		snapshot: snapshot,
		diff: diff,
		patch: patch
	};

	function snapshot(x) {
		return JSON.parse(JSON.stringify(x), dateReviver);
	}

	function diff(x1, x2, hasher) {
		var state = {
			patch: [],
			hash: hasher
		};

		return appendChanges(x1, x2, '', state).patch;
	}

	function appendChanges(x1, x2, path, state) {
		if(Array.isArray(x2)) {
			return appendArrayChanges(x1, x2, path, state);
		} else if(x2 && typeof x2 === 'object') {
			return appendObjectChanges(x1, x2, path, state);
		} else {
			return appendValueChanges(x1, x2, path, state);
		}
	}

	function appendObjectChanges(o1, o2, path, state) {
		state = Object.keys(o2).reduce(function(state, key) {
			var keyPath = path + '/' + key;
			if(key in o1) {
				appendChanges(o1[key], o2[key], keyPath, state);
			} else {
				state.patch.push({
					op: 'add',
					path: keyPath,
					value: o2[key]
				});
			}

			return state;
		}, state);

		return Object.keys(o1).reduce(function(state, key) {
			if(!(key in o2)) {
				state.patch.push({
					op: 'remove',
					path: path + '/' + key
				});
			}

			return state;
		}, state);
	}

	function appendArrayChanges(a1, a2, path, state) {
		return appendObjectChanges(hash(a1, state.hash), hash(a2, state.hash), path, state);
	}

	function appendValueChanges(before, after, path, state) {
		if(before !== after) {
			state.patch.push({
				op: 'replace',
				path: path,
				value: after
			});
		}

		return state;
	}

	function patch(changes, x, hasher) {
		return Array.isArray(x)
			? patchArray(changes, x, hasher)
			: doPatch(ops, changes, x);
	}

	function patchArray(changes, x, hasher) {
		var patched = doPatch(arrayOps, changes, hash(x, hasher));
		return Object.keys(patched).reduce(function(array, key) {
			array.push(patched[key]);
			return array;
		}, []).filter(withoutRemoved);
	}

	function withoutRemoved(x) {
		return x !== removed;
	}

	function doPatch(ops, changes, x) {
		return changes.reduce(function(x, change) {
			var op;
			if(change.path.length === 0) {
				return change.value;
			}

			op = ops[change.op];
			if(op) {
				op(x, change.path, change.value);
			}

			return x;
		}, x);
	}

	function setValue(x, path, value) {
		jsonPointer.setValue(x, path, value);
	}

	function remove(x, path) {
		jsonPointer.remove(x, path);
	}

	function markRemoved(x, path) {
		jsonPointer.setValue(x, path, removed);
	}

	function hash(array, id) {
		if(typeof id !== 'function') {
			id = identify
		}

		return array.reduce(function (index, item) {
			index[id(item)] = item;
			return index;
		}, {});
	}

	function dateReviver(_, value) {
		var match;

		if (typeof value === 'string') {
			match = jsonDateRx.exec(value);
			if (match) {
				return new Date(Date.UTC(
					+match[1], +match[2] - 1, +match[3],
					+match[4], +match[5], +match[6])
				);
			}
		}

		return value;
	}

	function identify(x) {
		return typeof x === 'object' && 'id' in x ? x.id : x;
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
