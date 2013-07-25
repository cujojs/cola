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

	var updater, removed;

	removed = {};

	updater = require('./updater')({
		new: function (array, index, item, identify) {
			var existing = array[index];
			if (!(existing && identify(existing) == identify(item))) {
				array[index] = item;
			}
		},
		updated: function (array, index, item) {
			array[index] = item;
		},
		deleted: function (array, index) {
			array[index] = removed;
		}
	});

	return function createArrayUpdater(identify) {
		return function updateArray(array, changes) {
			return updater(array || [], changes, identify).filter(notRemoved);
		};
	};

	function notRemoved(item) {
		return item !== removed;
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
