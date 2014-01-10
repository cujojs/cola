var Rest = require('cola/data/Rest');
var todosController = require('./todosController');

module.exports = {
	todosController: todosController,
	todosModel: new Rest('/todos')
};
