exports['shared tests'] = {
	tests: ['PersistentArray.js', 'WatchableCollection.js', 'CollectionAdapter.js']
};

exports['node tests'] = {
	environment: 'node',
	extends: 'shared tests'
};