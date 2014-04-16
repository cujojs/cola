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
			hash: typeof hasher === 'function' ? hasher : arrayIdentify
		};

		return appendChanges(x1, x2, '', state).patch;
	}

	function diffSet(s1, s2, hasher) {
		var state = {
			patch: [],
			hash: typeof hasher === 'function' ? hasher : objectIdentify
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
		state = Object.keys(o2).reduceRight(function(state, key) {
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

		return Object.keys(o1).reduceRight(function(state, key) {
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
		state = Object.keys(i2).reduceRight(function(state, key) {
			var path2, pos1, pos2, value1, value2;

			pos2 = i2[key];
			path2 = path + '/' + pos2;
			value2 = a2[pos2];

			if(key in i1) {
				pos1 = i1[key];
				value1 = a1[pos1];

				// TODO: Reinstate moves, but make them conditional
//				if(pos1 !== pos2) {
//					state.patch.push({
//						op: 'move',
//						path: path2,
//						from: path + '/' + pos1
//					})
//				}
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

		return Object.keys(i1).reduceRight(function(state, key) {
			if(!(key in i2)) {
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
		if(typeof hasher !== 'function') {
			hasher = objectIdentify;
		}

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

		var shadow = x === void 0 ? void 0 : snapshot(x);
		var arraysToFilter = {};
		x = changes.reduce(function(x, change) {
			var op;
			if(change.path.length === 0) {
				return change.value;
			}

			op = ops[change.op];
			if(op) {
				applyOp(arraysToFilter, x, change, shadow, op);
			}

			return x;
		}, x);

		Object.keys(arraysToFilter).forEach(function(key) {
			removeArrayItems(arraysToFilter[key]);
		});

		return x;
	}

	function applyOp(arraysToFilter, x, change, shadow, op) {
		var pointer = jsonPointer.find(x, change.path);
		if(pointer && change.op === 'remove' && Array.isArray(pointer.target)) {
			op = markRemoved;
			var p = change.path.slice(0, change.path.length - pointer.key.length);
			arraysToFilter[p] = pointer.target;
		}
		op(x, change, shadow);
	}

	function removeArrayItems(array) {
		// TODO: Evaluate whether splice or filter + overwrite is faster
		var i = array.length - 1, end, item;
		for(; i >= 0; --i) {
			item = array[i];
			// Coalesce span to splice
			if(item === removed) {
				end = i+1;
				do {
					--i;
				} while(array[i] === removed);

				array.splice(i+1, end-(i+1));
			}
		}
	}

	function add(x, change) {
		var value = typeof change.value === 'object' ? snapshot(change.value) : change.value;
		jsonPointer.add(x, change.path, value);
	}

	function setValue(x, change) {
		var value = typeof change.value === 'object' ? snapshot(change.value) : change.value;
		jsonPointer.setValue(x, change.path, value);
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
		return array.reduceRight(function (index, item, i) {
			index[id(item, i)] = item;
			return index;
		}, {});
	}

	function index(array, id) {
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

	function arrayIdentify(x /*, i*/) {
		return typeof x === 'object' && 'id' in x ? x.id : JSON.stringify(x);
	}

	function objectIdentify(x /*, i*/) {
		return typeof x === 'object' && 'id' in x ? x.id : JSON.stringify(x);
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
