(function (define) {
define(function (require) {
	"use strict";

	// Note: browser loaders and builders require that we don't "meta-program"
	// the require() calls:
	var compose, minimal, collectThenDeliver, validate;

	compose = require('./compose');
	minimal = require('./minimal');
	collectThenDeliver = require('./collectThenDeliver');
	validate = require('./validate');

	/**
	 * This is a composition of the strategies that Brian and I think
	 * make sense. :)
	 *
	 * @param options {Object} a conglomeration of all of the options for the
	 *   strategies used.
	 * @param options.targetFirstItem {Boolean} if truthy, the strategy
	 * will automatically target the first item that is added to the network.
	 * If falsey, it will not automatically target.
	 * @param options.validator {Function} if provided, will be used
	 * to validate data items on add and update events
	 *
	 * @return {Function} a composite network strategy function
	 */
	return function (options) {

		// compose them
		return compose([
			validate(options),
			collectThenDeliver(options),
			minimal(options)
		]);

	};

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));