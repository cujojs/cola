/** @license MIT License (c) copyright 2013 original authors */
(function (define) {
define(function () {

	var popIdentifierRx, isIdentifierRx;

	popIdentifierRx = /(?:\.|^)([a-zA-Z$_][a-zA-Z0-9$_]*)$|\["((?:[^"]|\\")*)"\]$|\['((?:[^']|\\')*?)'\]$|\[(\d+)\]$/;
	isIdentifierRx = /^[a-zA-Z$_][a-zA-Z0-9$_]*$/;

	return {
		parse: parse,
		stringify: stringify,
		pop: pop,
		safeProp: safeProp
	};

	/**
	 * Splits a json-path expression into separate identifiers.
	 * Supports dot notation and quoted identifiers:
	 *   'items[1].thing'
	 *   'items.1.thing'
	 *   'items[1]["thing"]'
	 * @param expr
	 * @return {Array}
	 */
	function parse (expr) {
		var props = [], popped;
		popped = pop(expr);
		while (popped.name) {
			props.unshift(popped.name);
			expr = popped.path;
		}
		return props;
	}

	function pop (path) {
		var remainder, name;
		remainder = path.replace(popIdentifierRx, function (m, i, qq, q, d) {
			name = i || qq || q || d;
			return '';
		});
		return { path: remainder, name: name };
	}

	function stringify (props) {
		return props.reduce(function (path, name) {
			return path + safeProp(name, !path);
		}, '');
	}


	function safeProp (name, first) {
		return isIdentifierRx.test(name)
			? (!first ? '.' : '') + name
			: '["' + escapeQuotes(name) + '"]';
	}

	function escapeQuotes (str) {
		return str.replace('"', '\\"');
	}

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(); }
));
