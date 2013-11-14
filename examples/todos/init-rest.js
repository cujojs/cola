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

		var Rest, Controller, validate;

		Rest = require('cola/data/Rest');
		Controller = require('./Controller2');
		validate = require('cola/data/validate');

		return function(validateTodo) {
			var datasource = new Rest('http://localhost:8080/todos', { patch: true });

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
