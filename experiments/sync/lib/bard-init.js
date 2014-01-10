var merge = require('wire/config/merge');
var fluent = require('wire/config/fluent');
var role = require('wire/query/role');
var dom = require('wire/dom');
var Map = require('wire/lib/Map');

var path = require('cola/lib/path');
var Dom = require('cola/dom/Dom');
var form = require('cola/dom/form');
var ProxyClient = require('cola/data/ProxyClient');
var Memory = require('cola/data/Memory');
var Synchronizer = require('cola/sync/Synchronizer');
var Scheduler = require('cola/sync/Scheduler');

var when = require('when');

var isController = role('controller');
var isModel = role('model');

var EventDispatcher = require('./EventDispatcher');

var reduce = Array.prototype.reduce;

module.exports = function(context) {
	return context
		.configure(dom)
		.configure(enableObjectConfig)
		.configure(fluent(bardInit));
};

function bardInit(config) {
	var proxies = new Map();
	var scheduler = new Scheduler();

	return config
		.add('@lifecycle', function() {
			return {
				postCreate: function(instance, component) {
					if(Array.isArray(component)) {
						return instance;
					}

					if(isController(component)) {
						var proxy = new ProxyClient();
						instance = proxy.proxy(instance);
						proxies.set(instance, proxy);
					} else if(isModel(component)) {
						instance = getDatasource(instance);
					}

					return instance;
				}
			}
		})
		.add('views@init', function(context) {
			return context.resolve(['qsa'], function(qsa) {
				qsa = qsa[0];
				var bardContainers = qsa('[data-bard]');

				return reduce.call(bardContainers, addViews, context);

				function addViews(context, root) {

					context.add('@app', function() {
						return root;
					});

					return reduce.call(qsa('[data-path]', root), function(context, node) {
						var n = node.parentNode;
						while(n !== root && !n.hasAttribute('data-path')) {
							n = n.parentNode;
						}

						if(n === root) {
							context.add(node.getAttribute('data-path') + '@view', function() {
								return node;
							});
						}

						return context;
					}, context);
				}
			});
		})
		.add('events@startup', function(context) {
			return context.resolve(['sync@startup'], function() {
				return context.resolve(['@app'], function(views) {
					return views.map(function(view) {
						return createEventDispatcher(view, context);
					});
				});
			});
		})
		.add('sync@startup', function(context) {
			var models = context.findComponents('@model');
			return models.reduce(function(registrations, model) {
				return registrations.concat(processModel(model));
			}, []);

			function processModel(model) {
				var path = model.metadata.roles.model;
				return context.resolve([path + '@model', path + '@view', path + '@controller'], function(models, views, controllers) {
					var clients = models.concat(views.map(function(node) {
						return new Dom(node);
					})).concat(controllers.reduce(function(controllers, c) {
						var proxy = proxies.get(c);
						return proxy ? controllers.concat(proxy) : controllers;
					}, []));

					return sync(models[0], clients);
				});
			}

			function sync (source, clients) {
				var s = new Synchronizer(clients);
				var period = Math.floor(100/clients.length);
				return s.fromSource(source).then(function() {
					scheduler.periodic(s.sync.bind(s), period);
				});
			}
		});

}

function enableObjectConfig(context) {
	return Object.create(context, {
		configure: {
			value: function(config) {
				if(config && typeof config === 'object') {
					return configureWithObject(config, context);
				} else {
					return context.configure.apply(this, arguments);
				}
			}
		}
	});

	function configureWithObject(object, context) {
		return Object.keys(object).reduce(function(context, key) {
			return context.add(keyToMetadata(key), function() {
				return object[key];
			});
		}, context);
	}

	function keyToMetadata(key) {
		if(/controller$/i.test(key)) {
			return key.slice(0, key.length - 10 ) + '@controller'
		} else if(/model$/i.test(key)) {
			return key.slice(0, key.length - 5 ) + '@model';
		} else if(/view/i.test(key)) {
			return key.slice(0, key.length - 4 ) + '@view';
		}
	}
}

function createEventDispatcher (view, context) {
	return new EventDispatcher(function (e, target, expression) {
		var query, method;

		if (/\S+\.\S+/.test(expression)) {
			expression = expression.split('.');
			query = expression[0];
			method = expression[1];
		}

		if (query) {
			var args = [e];
			if (e.type === 'submit') {
				e.preventDefault();
				args.unshift(form.getValues(e.target));
			}

			context.resolve([query], function (targets) {
				return targets.map(function (target) {
					var result = target[method].apply(target, args);
					if (e.target.reset) {
						e.target.reset();
					}
					return result;
				});
			});
		}

	}, view);
}

function getDatasource(x) {
	if(typeof x === 'object'
		&& typeof x.get === 'function') {
		return x;
	}

	return new Memory(x);
}
