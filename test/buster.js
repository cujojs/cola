require('gent/test-adapter/buster');

exports['shared tests'] = {
	tests: [
		'**/*-test.js'
	]
};

exports['node tests'] = {
	environment: 'node',
	extends: 'shared tests'
};
