(function(buster, createFormValidationHandler) {
"use strict";

var assert, refute, fail;

assert = buster.assert;
refute = buster.refute;
fail = buster.assertions.fail;

function createFakeNode() {
	return {
		className: ''
	};
}

function createForm() {
	return {
		elements: {},
		className: ''
	};
}

buster.testCase('validation/form/formValidationHandler', {

	'should add invalid class to form': function() {
		var formValidationHandler, form;

		form = createForm();
		formValidationHandler = createFormValidationHandler(form);

		formValidationHandler({ valid: false });

		assert.match(form.className, /\binvalid\b/);
	},

	'should add invalid class to associated node': function() {
		var formValidationHandler, form, node;

		form = createForm();
		node = createFakeNode();
		formValidationHandler = createFormValidationHandler(
			form, { findNode: function() { return node; } });

		formValidationHandler({ valid: false, errors: [{ name: 'test', code: 'test', message: 'test' }] });

		assert.match(node.className, /\binvalid\b/);
	},

	'should remove invalid class from form when it becomes valid': function() {
		var formValidationHandler, form;

		form = createForm();
		formValidationHandler = createFormValidationHandler(form);

		formValidationHandler({ valid: false });

		assert.match(form.className, /\binvalid\b/);

		formValidationHandler({ valid: true });

		refute.match(form.className, /\binvalid\b/);
	},

	'should remove invalid class from associated node when it becomes valid': function() {
		var formValidationHandler, form, node;

		form = createForm();
		node = createFakeNode();
		formValidationHandler = createFormValidationHandler(
			form, { findNode: function() { return node; } });

		formValidationHandler({ valid: false, errors: [{ name: 'test', code: 'test', message: 'test' }] });

		assert.match(node.className, /\binvalid\b/);

		formValidationHandler({ valid: true });

		refute.match(node.className, /\binvalid\b/);
	}

});
})(
	require('buster'),
	require('../../../validation/form/formValidationHandler')
);
