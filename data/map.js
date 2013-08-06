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

	var mapFetch, mapUpdate, curry;

	mapFetch = require('./mapFetch');
	mapUpdate = require('./mapUpdate');
	curry = require('../lib/fn').curry;

	/**
	 * Decorates a datasource by applying both fetch and update transformations
	 * to data that is retrieved via fetch() and changes saved via update().
	 * @param {{ fetch:function?, update:function? }} options transforms to
	 * apply to data as it is fetched from datasource, and to changes as they
	 * are sent to the datasource
	 * @param {object} datasource datasource to decorate
	 * @returns {object} decorated datasource
	 */
	return curry(function(options, datasource) {

		if(typeof options.fetch === 'function') {
			datasource = mapFetch(options.fetch, datasource);
		}

		if(typeof options.update === 'function') {
			datasource = mapUpdate(options.update, datasource);
		}

		return datasource;
	});

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
