(function (define) {
define(function (require) {
"use strict";

	// Note: browser loaders and builders require that we don't "meta-program"
	// the require() calls:
	var
		compose = require('./compose'),
		base = require('./base'),
		targetFirstItem = require('./targetFirstItem'),
		syncAfterJoin = require('./syncAfterJoin'),
		syncDataDirectly = require('./syncDataDirectly');

	/**
	 * This is a composition of the strategies that Brian and I think
	 * make sense. :)
	 * @param {Object} a conglomeration of all of the options for the
	 *   strategies used.
	 * @return {Function} a composite network strategy function
	 */
	return function (options) {

		var strategies;

		// configure strategies
		strategies = [
			syncAfterJoin(options),
			syncDataDirectly(options),
			targetFirstItem(options),
			base(options)
		];

		// compose them
		return compose(strategies);

	};

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));