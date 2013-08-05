/** @license MIT License (c) copyright 2013 original authors */
(function (define) {
define(function (require) {

	var parse;

	parse = require('./simpleTemplate').parse;

	/**
	 * Replaces simple tokens in a string.  Tokens are in the format ${key}
	 * or {{key}}. Tokens are replaced by the calling the options.transform
	 * function.
	 * @private
	 * @param {String} template
	 * @param {Object} options
	 * @param {Function} options.transform is a callback that transforms
	 *   a token to a string.
	 *   function transform (key, token) { return 'a string'; }
	 * @returns {String}
	 */
	function replaceTokens (template, options) {
		var transform, output;

		transform = options.transform;
		if (!transform) throw new Error('Transform function is not optional.');

		output = '';

		parse(
			template,
			function (text) { output += text; },
			function (key, token) {
				output += transform(key, token);
			}
		);

		return output;
	}

	return replaceTokens;

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));
