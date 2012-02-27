exports['shared tests'] = {
	tests: ['ArrayAdapter.js', 'ResultSetAdapter.js', 'ResultAdapter.js', './mediator/syncCollections.js']
};

exports['node tests'] = {
	environment: 'node',
	extends: 'shared tests'
};