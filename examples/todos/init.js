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

	var LocalStorage, Controller, validate, mapUpdate, defaults, fn, idSuffix;

	LocalStorage = require('cola/data/LocalStorage');
	Controller = require('./Controller2');
	validate = require('cola/data/validate');
	mapUpdate = require('cola/data/mapUpdate');
	defaults = require('cola/data/defaults');
	fn = require('cola/lib/fn');

	idSuffix = 1;

	return function(validateTodo) {
		var datasource = fn.sequence(
			validate(validateChanges),
			mapUpdate(defaults({ id: defaultId, completed: false, created: Date.now }))
		)(new LocalStorage('todos'));

		return {
			datasource: datasource,
			controller: new Controller()
		};

		function validateChanges(changes, metadata) {
			if(validateTodo) {
				changes.forEach(function(change) {
					validateTodo(change, metadata);
				});
			}
		}
	};

	function defaultId() {
		idSuffix += 1;
		return '' + Date.now() + idSuffix;
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
