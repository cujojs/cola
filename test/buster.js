exports['shared tests'] = {
	tests: [
		'ArrayAdapter.js',
		'ObjectAdapter.js',
		'QueryAdapter.js',
		'LocalStorageAdapter.js',
		'WidenAdapter.js',
		'transformCollection.js',
		'SortedMap.js',
		'Hub.js',
		'network/strategy/*.js',
		'transform/*.js',
		'relational/*.js',
		'relational/strategy/*.js',
		'projection/*.js',
		'comparator/*.js',
		'validation/**/*.js',
		'dom/*.js'
	]
};

exports['node tests'] = {
	environment: 'node',
	extends: 'shared tests'
};
