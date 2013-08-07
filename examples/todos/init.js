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

	var LocalStorage, Controller,
		reactiveCollection, reactiveModel, bindByAttr,
		cache, validate, mapUpdate, defaults, fn, idSuffix;

	LocalStorage = require('cola/data/LocalStorage');
	Controller = require('./Controller2');
	reactiveCollection = require('cola/view/array');
	reactiveModel = require('cola/view/model');
	bindByAttr = require('cola/view/bind/byAttr');
	cache = require('cola/data/cache');
	validate = require('cola/data/validate');
	mapUpdate = require('cola/data/mapUpdate');
	defaults = require('cola/data/defaults');
	fn = require('cola/lib/fn');

	idSuffix = 1;

	return function(listNode, formNode, validateTodo) {
		var controller, todoList, todoForm, datasource;

		datasource = fn.sequence(
			validate(validateChanges),
			mapUpdate(defaults({ id: defaultId, completed: false, created: Date.now }))
		)(new LocalStorage('todos'));

		todoList = reactiveCollection(listNode, {
			sectionName: 'created',
			sortBy: 'id', // FIXME
			binder: bindByAttr(),
			proxy: datasource.metadata.model
		});

		todoForm = reactiveModel(formNode, {
			binder: bindByAttr(),
			proxy: datasource.metadata.model
		});

		controller = new Controller();

		return {
			datasource: datasource,
			todoList: todoList,
			todoForm: todoForm,
			controller: controller
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
