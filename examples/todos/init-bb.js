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

	var bb, BackboneLocalStorage, MyCollection, MyModel,
		CollectionAdapter, Controller,
		reactiveCollection, reactiveModel, bindByAttr,
		validate, mapUpdate, defaults, fn;

	bb = require('backbone');
	BackboneLocalStorage = require('BackboneLocalStorage')
	CollectionAdapter = require('cola/etc/backbone/CollectionAdapter');
	Controller = require('./Controller-bb');
	reactiveCollection = require('cola/view/array');
	reactiveModel = require('cola/view/model');
	bindByAttr = require('cola/view/bind/byAttr');
	validate = require('cola/data/validate');
	mapUpdate = require('cola/data/mapUpdate');
	defaults = require('cola/data/defaults');
	fn = require('cola/lib/fn');

	MyModel = bb.Model.extend({});
	MyCollection = bb.Collection.extend({
		model: MyModel,
		localStorage: new BackboneLocalStorage('todos-bb')
	});

	return function(listNode, formNode, validateTodo) {
		var controller, todoList, todoForm, bbSource, datasource;

		bbSource = new CollectionAdapter(new MyCollection());

		datasource = fn.sequence(
			validate(validateTodos),
			mapUpdate(defaults({ completed: false, created: Date.now }))
		)(bbSource);

		todoList = reactiveCollection(listNode, {
			sectionName: 'todos',
			sortBy: 'created', // FIXME
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

		function validateTodos(changes, metadata) {
			if(validateTodo) {
				changes.forEach(function(change) {
					validateTodo(change, metadata);
				});
			}
		}
	};

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
