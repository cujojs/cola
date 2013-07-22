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

	from.byProperty = byProperty;
	from.reverse = reverse;
	from.compose = compose;

	return from;

	function from(it) {
		if(typeof it === 'function') {
			return it;
		}

		if(typeof it === 'string') {
			return byProperty(it);
		}

		return naturalOrder;
	}

	function naturalOrder(a, b) {
		return a == b ? 0
			: a < b ? -1
				: 1;
	}

	function byProperty(propName, comparator) {
		if(!comparator) {
			comparator = naturalOrder;
		}

		return function(a, b) {
			return comparator(a[propName], b[propName]);
		};
	}

	/**
	 * Creates a comparator function that compares items in the reverse
	 * order of the supplied comparator.
	 *
	 * @param comparator {Function} original comparator function to reverse
	 */
	function reverse(comparator) {
		if(typeof comparator != 'function') {
			throw new Error('comparator/reverse: input comparator must be provided');
		}

		return function(a, b) {
			return comparator(b, a);
		};
	}

	function compose(comparators/*...*/) {
		if(!arguments.length) {
			throw new Error('comparator/compose: No comparators provided');
		}

		comparators = arguments;

		return function(a, b) {
			var result, len, i;

			i = 0;
			len = comparators.length;

			do {
				result = comparators[i](a, b);
			} while(result === 0 && ++i < len);

			return result;
		};
	}


});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));
