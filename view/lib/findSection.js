(function (define) {
define(function (require) {

	return findSection;

	function findSection (options) {
		var scope, query, qsa;
		scope = options.sectionName;
		query = '[' + options.sectionAttr
			+ (scope ? '="' + scope + '"' : '')
			+ ']';
		qsa = options.qsa;
		return function (root) {
			return qsa(root, query)[0] || qsa(root, 'ul,ol,tbody,dl')[0];
		}
	}

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));
