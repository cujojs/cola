//var Rest = require('cola/data/Rest');
//var LocalStorage = require('cola/data/LocalStorage');
var todosController = require('./todosController');

module.exports = {
	todosController: todosController,
	todosModel: []
//	todosModel: new LocalStorage('todos', [])
//	todosModel: new Rest('/todos')
};
