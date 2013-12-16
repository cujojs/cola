var curl = {
	packages: {
		curl: { location: '../bower_components/curl/src/curl' },
		cola: { location: '../../' },
		when: { location: '../bower_components/when', main: 'when' },
		rest: { location: '../bower_components/rest', main: 'rest' },
		most: { location: '../bower_components/most', main: 'most',
			config: { moduleLoader: 'curl/loader/cjsm11'} }
	}
};
