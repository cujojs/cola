var a = [
	{ value: 'a' },
	{ value: 'b' },
	{ value: 'c' }
];

var a1, a2, p;

console.log('--------------------------');
console.log('starting arrays');
console.log('--------------------------');

a1 = JSON.parse(JSON.stringify(a));
a2 = JSON.parse(JSON.stringify(a1));
a2.splice(0, 1);
a2.splice(1, 1);
console.log('a1', JSON.stringify(a1));
console.log('a2', JSON.stringify(a2));

console.log('--------------------------');
console.log('cola jsonPatch');
console.log('--------------------------');
var jsonPatch = require('../lib/jsonPatch');
a1 = JSON.parse(JSON.stringify(a));
a2 = JSON.parse(JSON.stringify(a1));
a2.splice(0, 1);
a2.splice(1, 1);

try {
	p = jsonPatch.diff(a1, a2);
	console.log('diff a1 a2\n', JSON.stringify(p));
	console.log('patch a1\n', JSON.stringify(jsonPatch.patch(p, a1)));
} catch (e) {
	console.error('FAILED');
	console.error(e);
}

console.log('--------------------------');
console.log('json-diff-patch');
console.log('--------------------------');
var jdp = require('json-diff-patch');
var patch = require('json-diff-patch/jsonpatch');
a1 = JSON.parse(JSON.stringify(a));
a2 = JSON.parse(JSON.stringify(a1));
a2.splice(0, 1);
a2.splice(1, 1);

try {
	p = jdp.diff(a1, a2);
	console.log('diff a1 a2\n', JSON.stringify(p));
	console.log('patch a1\n', JSON.stringify(patch.apply(a1, p)));
	console.log('patch a1\n', JSON.stringify(jsonPatch.patch(p, a1)));
} catch (e) {
	console.error('FAILED');
	console.error(e);
}

console.log('--------------------------');
console.log('jsondiffpatch');
console.log('--------------------------');
var jsondiffpatch = require('jsondiffpatch');
var dp = jsondiffpatch.create({
	objectHash: function (obj) {
		return JSON.stringify(obj);
	}
});
a1 = JSON.parse(JSON.stringify(a));
a2 = JSON.parse(JSON.stringify(a1));
a2.splice(0, 1);
a2.splice(1, 1);

try {
	p = dp.diff(a1, a2);
	console.log('diff a1 a2\n', JSON.stringify(p));
	console.log('patch a1\n', JSON.stringify(dp.patch(a1, p)));
} catch (e) {
	console.error('FAILED');
	console.error(e);
}

console.log('--------------------------');
console.log('fast-json-patch (modified)');
console.log('--------------------------');
var fastJsonPatch = require('fast-json-patch/src/json-patch-duplex');
a1 = JSON.parse(JSON.stringify(a));
a2 = JSON.parse(JSON.stringify(a1));
a2.splice(0, 1);
a2.splice(1, 1);

try {
	p = fastJsonPatch.compare(a1, a2);
	console.log('diff a1 a2\n', JSON.stringify(p));
	fastJsonPatch.apply(a1, p)
	console.log('patch a1\n', JSON.stringify(a1));
//	console.log('patch a1\n', JSON.stringify(jsonPatch.patch(p, a1)));
} catch (e) {
	console.error('FAILED');
	console.error(e);
}
