/** @license MIT License (c) copyright 2013 original authors */
(function (define) {
define(function () {

	var floor = Math.floor;

	return {
		binary: binary,
		grope: grope
	};

	/**
	 * Searches through a list of items, looking for the correct slot
	 * position for an item.  Rounds up to the next slot for expected
	 * insertion behavior.
	 * @param {Number} min points at the first possible slot, typically 0
	 * @param {Number} len is the number of slots, typically array.length
	 * @param {Function} test is a function that evaluates the
	 *   current position. It must return a number, but only cares if
	 *   the number is positive, negative, or zero.
	 * @returns {Number} returns the slot where the item should be placed
	 *   into the list.
	 */
	function binary (min, len, test) {
		var max, mid, diff;
		max = min + len;
		mid = min;
		while (max - min > 0.5) {
			mid = (min + max) / 2;
			diff = test(floor(mid));
			if (diff > 0) min = mid;
			else if (diff < 0) max = mid;
			else min = max = mid; // exits loop
		}
		// round up to the next slot
		return floor(mid) + (diff >= 0 ? 1 : 0);
	}

	/**
	 * Gropes around a given position in a list to find an exact item.  Uses
	 * the match function to determine if it has a match.  Uses the test
	 * function to know if it has groped too far.
	 * @param {Number} approx
	 * @param {Number} min points at the first possible slot, typically 0
	 * @param {Number} len is the number of slots, typically array.length
	 * @param {Function} match must return true if the item at given position
	 *   is an exact match.
	 * @param {Function} test is a function that evaluates the
	 *   current position. It must return a number, but only cares if
	 *   the number is positive, negative, or zero.
	 * @return {Number}
	 */
	function grope (approx, min, len, match, test) {
		var offset, max, low, high, tooHigh, tooLow;

		offset = 1;
		max = min + len - 1;

		if (approx <= max && approx >= min && match(approx)) return approx;

		do {
			high = approx + offset;
			tooHigh = tooHigh || high > max;
			if (!tooHigh) {
				if (match(high)) return high;
				tooHigh = test(high) > 0;
			}
			low = approx - offset;
			tooLow = tooLow || low < min;
			if (!tooLow) {
				if (match(low)) return low;
				tooLow = test(low) < 0;
			}
			offset++;
		}
		while (!tooHigh || !tooLow);

		return -1;
	}

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(); }
));
