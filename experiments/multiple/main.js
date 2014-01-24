define(function(require) {

	var Dom = require('cola/dom/Dom');
	var ProxyClient = require('cola/data/ProxyClient');
	var Scheduler = require('cola/sync/Scheduler');
	var Synchronizer = require('cola/sync/Synchronizer');

	var data = 'Bob';

	var nameView1 = new Dom(document.querySelector('[name="name1"]'), 'keyup');
	var nameView2 = new Dom(document.querySelector('[name="name2"]'));

	var scheduler = new Scheduler();
	var s = new Synchronizer([nameView1, nameView2].concat(generateLotsOfElements()));
	s.set(data);

	scheduler.periodic(s.sync.bind(s), 50);

	function generateLotsOfElements() {
		var names = [];
		for(var i=0; i<5000; i++) {
			names.push(new Dom(createElement(i)));
		}
		return names;
	}
	function createElement(i) {
		var el = document.createElement('p');
		el.innerHTML = i;
		document.body.appendChild(el);
		return el;
	}
});

