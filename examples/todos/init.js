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

	var LocalStorage, Controller, validate, idSuffix;

	LocalStorage = require('cola/data/LocalStorage');
	Controller = require('./Controller2');
	validate = require('cola/data/validate');

	idSuffix = 1;

	return function(validateTodo) {
		var datasource = validate(validateChanges, new LocalStorage('todos'));

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
