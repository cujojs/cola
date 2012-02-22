exports['shared tests'] = {
	tests: ['ArrayAdapter.js', 'linkCollections.js']
};

exports['node tests'] = {
	environment: 'node',
	extends: 'shared tests'
};