//var JsonPatch = require('cola/data/JsonPatch');
//var JsonPatchWS = require('cola/data/JsonPatchWS');
//var LocalStorage = require('cola/data/LocalStorage');
var todosController = require('./todosController');

module.exports = {
	todosController: todosController,
	todosModel: [] // plain array
//	todosModel: new LocalStorage('todos', []) // LocalStorage
//	todosModel: new JsonPatch('/todos') // JsonPatch endpoint
//	todosModel: new JsonPatchWS('ws://localhost:8080/') // JsonPatch websocket
};
