var Client = require('./Client');
var localStorageStatusKey = 'sync-status';
var localStorageDataKey = 'sync-data';

exports.main = function() {

	var id = document.location.hash
		? document.location.hash.slice(1)
		: getId();

	var count = 0;
	var client = new Client('ws://localhost:8080');

	initClient(client).done(function(data) {

		var list = document.querySelector('ul');

		ready(id);
		updateList(list, data);
		client.onRemoteChange = function(client) {
			updateList(list, data);
			persistSyncStatus(client);
		};

		document.querySelector('[name="online"]').addEventListener('change', function(e) {
			if(e.target.checked) {
				client.sendChanges();
			}
		});

		document.querySelector('form').addEventListener('submit', function(e) {
			e.preventDefault();

			data[id + '-' + client._localVersion + '-' + count++] = e.target.elements[0].value;
			updateList(list, data);
			e.target.reset();

			if(e.target.elements.online.checked) {
				client.sendChanges();
			}
		});
	});

	function initClient(client) {
		var data = localStorage.getItem(localStorageDataKey + '-' + id);
		var status = localStorage.getItem(localStorageStatusKey + '-' + id);
		return data && status
			? client.init(JSON.parse(data), JSON.parse(status))
			: client.initFromRemote();
	}

	function getId() {
		return '' + Date.now() + '-' + Math.floor((Math.random() * 100));
	}

	function updateList(list, data) {
		list.innerHTML = Object.keys(data).reduceRight(function(html, k) {
			return '<li>' + data[k] + ' (' + k + ')</li>' + html;
		}, '');
		localStorage.setItem(localStorageDataKey + '-' + id, JSON.stringify(data));
	}

	function ready(id) {
		var e = document.createElement('p');
		e.innerHTML = 'Ready ' + id;
		document.body.appendChild(e);
	}

	function persistSyncStatus(client) {
		var status = client.status();
		localStorage.setItem(localStorageStatusKey + '-' + id, JSON.stringify(status));
	}

};
