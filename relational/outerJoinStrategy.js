/** MIT License (c) copyright B Cavalier & J Hann */

(function(define) {
define(function (require) {

	"use strict";

	var hashJoin, property;

	hashJoin = require('./hashJoin');
	property = require('../transform/property');

	/**
	 * Creates a join strategy that will perform a left outer hash join
	 * using the supplied options, using supplied key functions to generate
	 * hash keys for correlating items.
	 * @param options.leftKeyFunc {Function} function to create a join key
	 * for items on the left
	 * @param [options.rightKeyFunc] {Function} function to create a join key
	 * for items on the right.  If not provided, options.leftKeyFunc will be used
	 * @param [options.projection] {Function} function to project joined left
	 * and right values into a final join result
	 * @param [options.multiValue] {Boolean} if truthy, allows the projection to
	 * act on the complete set of correlated right-hand items, rather than on each
	 * distinct left-right pair.
	 */
	return function createOuterJoinStrategy(options) {

		var leftKeyFunc, rightKeyFunc, projection, multiValue;

		if(!(options && options.leftKeyFunc)) {
			throw new Error('options.leftKeyFunc must be provided')
		}

		leftKeyFunc  = options.leftKeyFunc;
		if(typeof leftKeyFunc != 'function') {
			leftKeyFunc = property(leftKeyFunc);
		}

		rightKeyFunc = options.rightKeyFunc || leftKeyFunc;
		if(typeof rightKeyFunc != 'function') {
			rightKeyFunc = property(rightKeyFunc);
		}

		projection   = options.projection || defaultProjection;
		multiValue   = options.multiValue;

		// Return the join strategy
		return function outerHashJoin(left, right) {

			return hashJoin.leftOuterJoin(
				left, leftKeyFunc,
				right, rightKeyFunc,
				projection, multiValue
			);

		}
	};

	function defaultProjection(left, right, key) {
		return {
			key: key,
			left: left,
			right: right
		};
	}

});
})(
	typeof define == 'function'
		? define
		: function(factory) { module.exports = factory(require); }
);
