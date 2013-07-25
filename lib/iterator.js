/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author: Brian Cavalier
 * @author: John Hann
 */

(function(define) { 'use strict';
define(function() {

	iterator.reduce = reduce;

	function iterator(x) {
		if(x != null) {
			if(typeof x.next === 'function') {
				return x;
			}

			if(typeof x.iterator === 'function') {
				return x.iterator();
			}

			if(typeof x !== 'function' && typeof x.length === 'number') {
				return new ArrayLikeIterator(x);
			}
		}
		throw new Error('not an iterable');
	}

	function ArrayLikeIterator(array) {
		this._array = array;
		this._index = 0;
	}

	ArrayLikeIterator.prototype.next = function() {
		if(this._index >= this._array.length) {
			return { done: true };
		}

		return { done: false, value: this._array[this._index++] };
	};

	function reduce(reducer, initial, iterator) {
		var result, next;

		result = initial;

		while(true) {
			next = iterator.next();

			if(next.done) {
				return result;
			}

			result = reducer(result, next.value);
		}
	}

	return iterator;
});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));
