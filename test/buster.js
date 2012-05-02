exports['shared tests'] = {
	tests: [
		'ArrayAdapter.js',
		'ObjectAdapter.js',
		'QueryAdapter.js',
		'WidenAdapter.js',
		'transformCollection.js',
		'SortedMap.js',
		'Hub.js',
		'network/strategy/*.js',
		'transform/*.js',
		'relational/*.js',
		'relational/strategy/*.js',
		'projection/*.js',
		'comparator/*.js'
	]
};

exports['node tests'] = {
	environment: 'node',
	extends: 'shared tests'
};
