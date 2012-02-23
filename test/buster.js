exports['shared tests'] = {
	tests: ['ArrayAdapter.js', './mediator/syncCollections.js']
};

exports['node tests'] = {
	environment: 'node',
	extends: 'shared tests'
};