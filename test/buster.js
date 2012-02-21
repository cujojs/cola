exports['shared tests'] = {
	tests: ['ArrayAdapter.js', 'CollectionMediator.js']
};

exports['node tests'] = {
	environment: 'node',
	extends: 'shared tests'
};