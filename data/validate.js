/** @license MIT License (c) copyright 2010-2013 original author or authors */

/**
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author: Brian Cavalier
 * @author: John Hann
 */

(function(define) { 'use strict';
define(function(require) {

	var when = require('when');

	/**
	 * Decorates a datasource with validation functionality.  Applies a
	 * validator function to all changes passed to datasource.update.  If
	 * the validator returns successfully, datasource.update is called.  If
	 * the validator throws or returns a rejected promise, datasource.update
	 * is *not* called.
	 * @param {object} datasource datasource to decorate
	 * @param {function} validator validation function. Receives a diff and
	 *  datasource's metadata
	 * @returns {object} decorated datasource
	 */
	return function validate(datasource, validator) {

		return Object.create(datasource, {
			update: { value: update, writable: true, configurable: true }
		});

		function update(changes) {
			var metadata = datasource.metadata;

			return when(changes, function(changes) {
				return validator(changes, metadata);
			}).then(function() {
				return datasource.update(changes);
			});
		}
	};

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
