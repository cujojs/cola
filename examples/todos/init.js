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

	var LocalStorage, Controller, validate;

	var ArrayStorage = require('cola/data/Array');
	LocalStorage = require('cola/data/LocalStorage');
	Controller = require('./Controller2');
	validate = require('cola/data/validate');

	return function(validateTodo) {
//		var a = [];
//		for(var i=0; i<10000; i++) {
//			a.push({
//				id: '' + Date.now() + i + Math.random(),
//				description: 'a' + i,
//				created: Date.now()
//			});
//		}
//		var datasource = new ArrayStorage(a);
		var datasource = new LocalStorage('todos');

		return {
			datasource: validate(validateChanges, datasource),
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

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
