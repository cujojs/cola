(function (define) {
define(function (require) {
"use strict";

	// Note: browser loaders and builders require that we don't "meta-program"
	// the require() calls:
	var
		compose = require('./compose'),
		minimal = require('./minimal'),
		collectThenDeliver = require('./collectThenDeliver')/*,
		provideTotalIfMissing = require('./provideTotalIfMissing')*/;

	/**
	 * This is a composition of the strategies that Brian and I think
	 * make sense. :)
	 *
	 * @param options {Object} a conglomeration of all of the options for the
	 *   strategies used.
	 * @param options.targetFirstItem {Boolean} if truthy, the strategy
	 * will automatically target the first item that is added to the network.
	 * If falsey, it will not automatically target.
	 *
	 * @return {Function} a composite network strategy function
	 */
	return function (options) {

		var strategies;

		// configure strategies
		strategies = [
			collectThenDeliver(options)/*,
			provideTotalIfMissing(options)*/
		];

		strategies.push(minimal(options));

		// compose them
		return compose(strategies);

	};

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));