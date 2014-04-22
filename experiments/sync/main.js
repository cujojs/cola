//var JsonPatch = require('cola/data/JsonPatch');
var JsonPatchWS = require('cola/data/JsonPatchWS');
//var LocalStorage = require('cola/data/LocalStorage');
var todosController = require('./todosController');

module.exports = function(context) {
	return context
		.add('todos@controller', function() {
			return todosController;
		})
		.add('todos@model', function() {
			return new JsonPatchWS('ws://localhost:8080/')
		})
};
