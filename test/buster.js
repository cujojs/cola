exports['shared tests'] = {
	tests: ['ArrayAdapter.js', 'syncCollections.js']
};

exports['node tests'] = {
	environment: 'node',
	extends: 'shared tests'
};