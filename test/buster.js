exports['shared tests'] = {
//	tests: ['ArrayAdapter.js', 'WatchableCollection.js', 'CollectionAdapter.js', 'CollectionMediator.js']
	tests: ['ArrayAdapter.js']//, 'CollectionMediator.js']
};

exports['node tests'] = {
	environment: 'node',
	extends: 'shared tests'
};