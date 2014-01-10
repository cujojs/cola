var curl = {
	packages: {
		app: {location: '.', config: { moduleLoader: 'curl/loader/cjsm11' } },
		curl: { location: '../bower_components/curl/src/curl' },
		cola: { location: '../..' },
		when: { location: '../bower_components/when', main: 'when' },
		rest: { location: '../bower_components/rest', main: 'rest' },
		wire: { location: '../bower_components/wire',
			config: { moduleLoader: 'curl/loader/cjsm11' } },
		most: { location: '../bower_components/most', main: 'most',
			config: { moduleLoader: 'curl/loader/cjsm11'} }
	}
};
