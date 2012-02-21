exports['shared tests'] = {
	tests: ['ArrayAdapter.js', 'WatchableCollection.js', 'CollectionMediator.js']
};

exports['node tests'] = {
	environment: 'node',
	extends: 'shared tests'
};