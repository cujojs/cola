exports['shared tests'] = {
	tests: ['ArrayAdapter.js', 'ResultSetAdapter.js', 'ResultAdapter.js', 'QueryAdapter.js',
		'mediator/syncCollections.js', 'transformCollection.js', 'transform/*.js', 'SortedMap.js']
};

exports['node tests'] = {
	environment: 'node',
	extends: 'shared tests'
};