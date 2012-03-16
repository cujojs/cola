exports['shared tests'] = {
	tests: ['ArrayAdapter.js', 'ResultSetAdapter.js', 'ResultAdapter.js', 'QueryAdapter.js',
		'transformCollection.js', 'SortedMap.js',
		'mediator/*.js', 'transform/*.js', 'relational/*.js', 'projection/*.js']
};

exports['node tests'] = {
	environment: 'node',
	extends: 'shared tests'
};