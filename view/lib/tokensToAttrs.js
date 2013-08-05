/** @license MIT License (c) copyright 2013 original authors */
(function (define) {
define(function (require) {

	var jsonpath = require('./jsonpath');

	var tokenRx, tagInRx, tagOutRx, attrInRx, attrOutRx,
		parseBardHtmlRx;

	tokenRx = '\\{\\{(#?)(/?)([^}]*)\\}\\}';
	tagInRx = '<([_$a-zA-Z][_$a-zA-Z0-9]*)\\s*';
	tagOutRx = '(\/?>)';
	// attributes have some additional chars that tags don't:
	attrInRx = '([_$a-zA-Z][_$a-zA-Z0-9\\-]*)\\s*=\\s*["\']?';
	attrOutRx = '(["\'])';

	parseBardHtmlRx = new RegExp(
		[tagInRx, attrInRx, tokenRx, attrOutRx, tagOutRx].join('|'),
		'g'
	);

	/**
	 * Converts {{}} or {{{}}} tokens to html tags with data-bard-bind attrs
	 * and data-bard-section attrs.
	 * TODO: support {{{}}} (unescaped html) tokens
	 * Converts keys to jsonpath by keeping track of the sections here.
	 * Thus, we don't have to do it in the dom which is expensive!
	 * @param {String} template is an HTML template.
	 * @param {Object} options are for future use.
	 * @return {String}
	 */
	function tokensToAttrs (template, options) {
		var end, paths, inTag, inAttr, hasBardAttr, bardAttrs;

		template = String(template);
		end = 0;
		paths = [];

		return template.replace(parseBardHtmlRx, function (m, tagIn, attrIn, section, endSection, token, attrOut, tagOut, pos) {
			var out;

			if ('' === token) {
				throw new Error('Blank token not allowed in template.');
			}

			if (token) {
				// normalize token, splitting a token that may already be a path
				token = jsonpath.stringify(paths.concat(jsonpath.parse(token)));
			}
			if (inAttr) {
				if (section || endSection) {
					sectionError(token);
				}
				else if (attrOut) {
					// grab any trailing attribute characters
					if (hasBardAttr && pos > end) {
						collect(inAttr, template.slice(end, pos));
					}
					inAttr = false;
				}
				else if (token) {
					hasBardAttr = true;
					// grab any leading attribute characters
					if (pos > end) {
						collect(inAttr, template.slice(end, pos));
					}
					// save attribute token
					collect(inAttr, token);
					out = '';
				}
			}
			else if (inTag) {
				// TODO: allow a section tag inside an element to signify the element is the root of the section?
				if (section || endSection) {
					sectionError(token);
				}
				else if (tagOut) {
					inTag = false;
					if (hasBardAttr) {
						out = bardAttrsOutput(bardAttrs) + tagOut;
					}
				}
				else if (attrIn) {
					inAttr = attrIn;
				}
				else if (token) {
					// this is an empty attribute
					hasBardAttr = true;
					collect('', token);
					out = '';
				}
			}
			else {
				if (tagIn) {
					inTag = tagIn;
					bardAttrs = {};
					hasBardAttr = false;
				}
				else if (section) {
					out = bardSectionOutput(token);
					paths.push(token);
				}
				else if (endSection) {
					out = bardEndSectionOutput(token);
					paths.pop();
				}
				else if (token) {
					// this is a text/html placeholder
					out = bardTextNodeOutput(token);
				}
			}

			end = pos + m.length;

			return out != null ? out : m;

			function collect (attr, snippet) {
				if (!(attr in bardAttrs)) bardAttrs[attr] = [];
				bardAttrs[attr].push(snippet);
			}
		});

	}

	return tokensToAttrs;

	function bardAttrsOutput (attrs) {
		// collect attrs into a descriptor string
		// data-bard-bind="attr1:template1;attr2:template2"
		return ' data-bard-bind="' + Object.keys(attrs).map(function (attr) {
			var template;
			template = attrs[attr].join('');
			// empty tokens have a special attribute
			return (attr || '(empty)') + ':' + template;
		}).join(';') + '"';
	}

	function bardTextNodeOutput (token) {
		return '<span data-bard-bind="text:' + token + '"></span>';
	}

	function bardSectionOutput (name) {
		return '<div data-bard-section="' + name + '">';
	}

	function bardEndSectionOutput () {
		return '</div>';
	}

	function sectionToken (token) {
		return token && token.charCodeAt(0) == 35 /* # */ ? token.slice(1) : '';
	}

	function endSectionToken (token) {
		return token && token.charCodeAt(0) == 47 /* / */ ? token.slice(1) : '';
	}

	function sectionError (token) {
		throw new Error('Section tag found inside attribute or HTML tag. ' + token);
	}

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));
