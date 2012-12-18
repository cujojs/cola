exports['shared tests'] = {
	tests: [
		'**/*-test.js',
		'cola.js',
		'SortedMap.js',
		'adapter/*.js',
		'network/strategy/*.js',
		'transform/*.js',
		'relational/*.js',
		'relational/strategy/*.js',
		'projection/*.js',
		'comparator/*.js',
		'validation/**/*.js',
		'dom/**/*.js'
	]
};

exports['node tests'] = {
	environment: 'node',
	extends: 'shared tests'
};
