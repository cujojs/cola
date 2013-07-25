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

	var updater = require('./updater')({
		new: setProperty,
		updated: setProperty,
		deleted: deleteProperty
	});

	return function updateObject(object, changes) {
		return updater(object || {}, changes);
	};

	function setProperty(object, property, value) {
		object[property] = value;
	}

	function deleteProperty(object, property) {
		delete object[property];
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));
