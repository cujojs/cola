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

	var rest, pathPrefix, entity, mime, location,
		Rest, ArrayMetadata, ObjectMetadata,
		Controller, reactiveCollection, reactiveModel, bindByAttr,
		cache, validate, mapUpdate, defaults, fn;

	rest = require('rest');
	pathPrefix = require('rest/interceptor/pathPrefix');
	entity = require('rest/interceptor/entity');
	mime = require('rest/interceptor/mime');
	location = require('rest/interceptor/location');
	ArrayMetadata = require('cola/data/metadata/ArrayMetadata');
	ObjectMetadata = require('cola/data/metadata/ObjectMetadata');
	Rest = require('cola/data/Rest');
	Controller = require('./Controller2');
	reactiveCollection = require('cola/view/array');
	reactiveModel = require('cola/view/model');
	bindByAttr = require('cola/view/bind/byAttr');
	cache = require('cola/data/cache');
	validate = require('cola/data/validate');
	mapUpdate = require('cola/data/mapUpdate');
	defaults = require('cola/data/defaults');
	fn = require('cola/lib/fn');

	return function(listNode, formNode, validateTodo) {
		var controller, todoList, todoForm,
			client, metadata, datasource;

		client = rest
			.chain(mime, { mime: 'application/json' })
			.chain(location)
			.chain(pathPrefix, { prefix: 'http://localhost:8080/todos' })
			.chain(entity);

		metadata = new ArrayMetadata(new ObjectMetadata());

		datasource = fn.sequence(
			validate(validateChanges),
			mapUpdate(defaults({ completed: false, created: Date.now }))
		)(new Rest(client, metadata, { updateMethod: 'patch' }));

		todoList = reactiveCollection(listNode, {
			sectionName: 'todos',
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



});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
