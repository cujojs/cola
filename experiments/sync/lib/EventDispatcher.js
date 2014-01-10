var reduce = Array.prototype.reduce;
var eventAttrs = {
	'data-on-click': 'click',
	'data-on-submit': 'submit'
};
var eventTypes = Object.keys(eventAttrs).reduce(function(types, attr) {
	types[eventAttrs[attr]] = attr;
	return types;
}, {});

module.exports = EventDispatcher;

function EventDispatcher(handler, root) {
	this.handler = runHandler;
	this.node = root;

	var events = this.events = findEventTypes(root);
	Object.keys(events).forEach(function(key) {
		root.addEventListener(events[key], runHandler, false);
	});

	function runHandler(e) {
		findTarget(handler, root, e);
	}

	function findTarget(handler, root, e) {
		var type = e.type;

		if(!(type in eventTypes)) {
			return;
		}

		var target = e.target;
		var attr;
		do {
			attr = target.getAttribute(eventTypes[type]);
			if(attr) {
				return handler(e, target, attr);
			}
		} while(target !== root && (target = target.parentNode));
	}
}

EventDispatcher.prototype = {
	dispose: function() {
		var events = this.events;
		var handler = this.handler;
		Object.keys(events).forEach(function(key) {
			console.log(events[key]);
			root.removeEventListener(events[key], handler, false);
		});
	}
};

function findEventTypes(root, allowed) {
	if(!allowed) {
		allowed = eventAttrs;
	}

	return foldt(root, function(events, node) {
		return reduce.call(node.attributes, function(events, attr) {
			if(attr.name in allowed) {
				events[attr.name] = allowed[attr.name];
			}
			return events;
		}, events);
	}, {});
}

function foldt(root, f, initial) {
	var result = reduce.call(root.children, function(result, child) {
		return child.nodeType === 1
			? foldt(child, f, result)
			: result;
	}, initial);

	return f(result, root);
}
