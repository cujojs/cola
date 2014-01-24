//var JsonPatch = require('cola/data/JsonPatch');
//var LocalStorage = require('cola/data/LocalStorage');
var todosController = require('./todosController');

module.exports = {
	todosController: todosController,
	todosModel: [] // plain array
//	todosModel: new LocalStorage('todos', []) // LocalStorage
//	todosModel: new JsonPatch('/todos') // JsonPatch endpoint
};
