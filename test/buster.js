exports['shared tests'] = {
	tests: [
		'ArrayAdapter.js',
		'ObjectAdapter.js',
		'ResultSetAdapter.js',
		'ResultAdapter.js',
		'QueryAdapter.js',
		'transformCollection.js',
		'SortedMap.js',
		'mediator/*.js',
		'transform/*.js',
		'relational/*.js',
		'relational/strategy/*.js',
		'projection/*.js'
	]
};

exports['node tests'] = {
	environment: 'node',
	extends: 'shared tests'
};