var jsonpatch = require('../lib/jsonpatch');

console.log(jsonpatch.diff(1, 2));
console.log(jsonpatch.patch(jsonpatch.diff(1, 2), 1));

var o = { a: 1, b: 2, c: 3 };

var changes = jsonpatch.diff(o, { a: 1, b: 3, d: 4 });

console.log(changes);
console.log(o);
console.log(jsonpatch.patch(changes, o));

var array = [
	{ id: 1, person: { name: 'a' }},
	{ id: 2, person: { name: 'b' }},
	{ id: 3, person: { name: 'c' }},
	{ id: 4, person: { name: 'd' }},
	{ id: 5, person: { name: 'e' }},
	{ id: 6, person: { name: 'f' }}
];

var changes = jsonpatch.diff(array, [
	{ id: 2, person: { name: 'b1' }},
	{ id: 3, person: {}},
	{ id: 1, person: { name: 'a' }},
	{ id: 7, person: { name: 'x' }},
	{ id: 8, person: { dob: new Date() }}
]);
console.log(JSON.stringify(changes));
console.log(array);
console.log(jsonpatch.patch(changes, array));

var a = [];
for(var i=0; i<10000; i++) {
	a.push({ id: i, name: i });
}

start = Date.now();
var a2 = jsonpatch.snapshot(a);
var elapsed = Date.now() - start;

a2.forEach(function(x) {
	x.name = 'a'+ x.name;
});

var start = Date.now();
jsonpatch.diff(a, a2);
console.log(elapsed + Date.now() - start);
