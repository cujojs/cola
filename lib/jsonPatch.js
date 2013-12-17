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
		add: setValue,
		replace: setValue,
		remove: remove,
		move: move
	};

	var setOps = {
		add: setValue,
		replace: setValue,
		remove: markRemoved,
		move: move
	};

	var removed = {};

	return {
		snapshot: snapshot,
		diff: diff,
		patch: patch,
		diffSet: diffSet,
		patchSet: patchSet
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

	function diffSet(s1, s2, hasher) {
		var state = {
			patch: [],
			hash: hasher
		};

		return appendObjectChanges(
			hash(s1, state.hash), hash(s2, state.hash), '', state).patch;
	}

	function appendChanges(x1, x2, path, state) {
		if(Array.isArray(x2)) {
			return appendListChanges(x1, x2, path, state);
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

	function appendListChanges(a1, a2, path, state) {
		var i1 = index(a1, state.hash);
		var i2 = index(a2, state.hash);
		state = Object.keys(i2).reduce(function(state, key) {
			var path2, pos1, pos2, value1, value2;

			pos2 = i2[key];
			path2 = path + '/' + pos2;
			value2 = a2[pos2];

			if(key in i1) {
				pos1 = i1[key];
				value1 = a1[pos1];

				if(pos1 !== pos2) {
					state.patch.push({
						op: 'move',
						path: path2,
						from: path + '/' + pos1
					})
				}
				appendChanges(value1, value2, path2, state);
			} else {
				state.patch.push({
					op: pos2 in a1 ? 'replace' : 'add',
					path: path2,
					value: value2
				});
			}

			return state;
		}, state);

		return Object.keys(i1).reduce(function(state, key) {
			var pos1 = i1[key];
			if(!(key in i2) && !(pos1 in a2)) {
				state.patch.push({
					op: 'remove',
					path: path + '/' + i1[key]
				});
			}

			return state;
		}, state);
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

	function patch(changes, x) {
		return doPatch(ops, changes, x);
	}

	function patchSet(changes, x, hasher) {
		var patched = doPatch(setOps, changes, hash(x, hasher));
		return patched.reduce(function(array, key) {
			array.push(patched[key]);
			return array;
		}, []).filter(withoutRemoved);
	}

	function withoutRemoved(x) {
		return x !== removed;
	}

	function doPatch(ops, changes, x) {
		if(!changes || changes.length === 0) {
			return x;
		}

		changes = snapshot(changes);
		var shadow = x === void 0 ? void 0 : snapshot(x);
		x = changes.reduce(function(x, change) {
			var op;
			if(change.path.length === 0) {
				return change.value;
			}

			op = ops[change.op];
			if(op) {
				if(change.op === 'remove' && Array.isArray(x)) {
					op = markRemoved;
				}
				op(x, change, shadow);
			}

			return x;
		}, x);

		if(Array.isArray(x)) {
			return x.filter(withoutRemoved);
		}

		return x;
	}

	function add(x, change) {
		jsonPointer.add(x, change.path, change.value);
	}

	function setValue(x, change) {
		jsonPointer.setValue(x, change.path, change.value);
	}

	function remove(x, change) {
		jsonPointer.remove(x, change.path);
	}

	function markRemoved(x, change) {
		jsonPointer.setValue(x, change.path, removed);
	}

	function move(x, change, shadow) {
		jsonPointer.setValue(x, change.path, jsonPointer.getValue(shadow, change.from));
	}

	function hash(array, id) {
		if(typeof id !== 'function') {
			id = identify
		}

		return array.reduceRight(function (index, item, i) {
			index[id(item, i)] = item;
			return index;
		}, {});
	}

	function index(array, id) {
		if(typeof id !== 'function') {
			id = identify
		}

		return array.reduceRight(function (index, item, i) {
			index[id(item, i)] = i;
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

	function identify(x, i) {
		return typeof x === 'object' && 'id' in x ? x.id : i;
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
