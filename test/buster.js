exports['shared tests'] = {
	tests: ['PersistentArray.js', 'WatchableCollection.js']
};

exports['node tests'] = {
	environment: 'node',
	extends: 'shared tests'
};