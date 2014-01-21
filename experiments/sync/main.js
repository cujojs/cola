//var Rest = require('cola/data/Rest');
var LocalStorage = require('cola/data/LocalStorage');
var todosController = require('./todosController');

module.exports = {
	todosController: todosController,
	todosModel: new LocalStorage('todos', [])
//	todosModel: [] // Use a plain array, or
//	todosModel: new Rest('/todos') // a Rest endpoint
};
