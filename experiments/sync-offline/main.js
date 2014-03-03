exports.main = main;

var Client = require('./Client');

function main() {

	var id = getId();
	var count = 0;
	var client = new Client('ws://localhost:8080');

	client.ready.done(function(data) {

		var list = document.querySelector('ul');

		ready(id);
		update(list, data);
		client.onRemoteChange = update.bind(void 0, list);

		document.querySelector('[name="online"]').addEventListener('change', function(e) {
			if(e.target.checked) {
				client.sendChanges();
			}
		});

		document.querySelector('form').addEventListener('submit', function(e) {
			e.preventDefault();

			data[id + '-' + client._localVersion + '-' + count++] = e.target.elements[0].value;
			update(list, data);

			if(e.target.elements.online.checked) {
				client.sendChanges();
			}
		});
	});
}

function getId() {
	return '' + Date.now() + '-' + Math.floor((Math.random() * 100));
}

function update(list, data) {
	list.innerHTML = Object.keys(data).reduceRight(function(html, k) {
		return '<li>' + data[k] + ' (' + k + ')</li>' + html;
	}, '');
}

function ready(id) {
	var e = document.createElement('p');
	e.innerHTML = 'Ready ' + id;
	document.body.appendChild(e);
}
