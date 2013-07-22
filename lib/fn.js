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

	var bind, uncurryThis, call, apply, slice;

	bind = Function.prototype.bind;
	uncurryThis = bind.bind(bind.call);
	call = uncurryThis(bind.call);
	apply = uncurryThis(bind.apply);
	slice = uncurryThis([].slice);

	return {
		identity: identity,
		constant: constant,
		curry: curry,
		partial: partial,
		compose: curry(compose),
		composeN: composeN,
		sequence: sequence,
		flip: flip,
		flipc: compose(curry, flip),
		uncurryThis: uncurryThis
	};

	/**
	 * Function that always returns its input
	 * @param {*} x
	 * @returns {*} x
	 */
	function identity(x) {
		return x;
	}

	/**
	 * Return a function that always returns x
	 * @param {*} x
	 * @returns {function}
	 */
	function constant(x) {
		return function() {
			return x;
		};
	}

	/**
	 * Curry an N-argument function to a series of 1-argument functions
	 * (technically less-than-N-argument functions since this is Javascript)
	 * @param  {function} f Function to curry
	 * @return {function} curried version of f
	 */
	function curry(f /*, arity */) {
		return curryArity(f, arguments.length > 1 ? arguments[1] : f.length, []);
	}

	function curryArity(fn, arity, args) {
		return function() {
			var accumulated = args.concat(slice(arguments));

			return accumulated.length < arity
				? curryArity(fn, arity, accumulated)
				: apply(fn, this, accumulated);
		};
	}

	/**
	 * Partially apply f to supplied args
	 * @param {function} f function to partially apply
	 * @returns {function} partially applied f
	 */
	function partial(f /*, ...args*/) {
		var args = slice(arguments, 1);
		return function() {
			return apply(f, this, args.concat(slice(arguments)));
		};
	}

	/**
	 * Right to left composition of 2 functions
	 * @param {function} f
	 * @param {function} g
	 * @returns {function} h(x) = f(g(x))
	 */
	function compose(f, g) {
		return function(x) {
			return f(g(x));
		};
	}

	/**
	 * Right to left composition of N functions
	 * @returns {function} f(x) = fn(...f2(f1(x)))
	 */
	function composeN(/*...funcs*/) {
		var funcs = slice(arguments);
		return function(x) {
			return funcs.reduceRight(function(x, f) {
				return f(x);
			}, x);
		};
	}

	/**
	 * Left to right composition of N functions
	 * @returns {Function} f(x) = f1(f2(...fn(x)))
	 */
	function sequence(/*...funcs*/) {
		var funcs = slice(arguments);
		return function(x) {
			return funcs.reduce(function(x, f) {
				return f(x);
			}, x);
		};
	}

	/**
	 * Return a function with its arguments reversed
	 * @param {function} f(x,y)
	 * @returns {Function} f(y,x)
	 */
	function flip(f) {
		return function(x, y) {
			return f(y, x);
		};
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));
