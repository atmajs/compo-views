(function(){
	io.File.disableCache()
	
	var server = require('atma-server');	


	include.exports = {
		process: function () {
			app.config.server.handlers = {
				'^/echo/' : EchoHandler,
				'^/error/' : ErrorHandler,
				'^/foo/' : FooService,
				'^/entity/': EntityService,
			};

			app
				.findAction('server')
				.done(function(action){
					action.process({
						port: 5771,
					}, function(){});
				});
		}
	};

	var EchoHandler = {
		process: function(req, res) {
			if (req.body) {
				var body = typeof req.body === 'object' ? JSON.stringify(req.body) : req.body;
				res.writeHead(200, {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
				});
				
				res.end(body);
				return;
			}
			res.writeHead(200);
			req.pipe(res, { end: true });
		}
	};
	var ErrorHandler = {
		process: function(req, res) {
			var status = req.query.status || 500,
				message = req.query.message || 'Uknown error',
				body = JSON.stringify({ message: message});
				
			res.writeHead(status, {
				'Content-Type': 'application/json'
			});
			res.end(body);
		}
	};
	
	var FooService = server.HttpService({
		'single': function () {
			this.resolve({
				name: 'MyFooName'
			});
		}
	});
	
	
	var EntityStore   = {
		'foo' : { name: 'FooName' },
		'baz' : { name: 'BazName' }
	};
	var EntityService = server.HttpService({
		meta: {
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
			}
		},
		'$get /:id': function (req, res, params) {
			var obj = EntityStore[params.id]
			if (obj == null) {
				this.reject('NotFound', 404);
				return;
			}
			
			this.resolve(obj);
		},
		'$delete /:id': function(req, res, params) {
			delete EntityStore[params.id];
		},
		'$post /': function(req, res, params){
			if (req.body == null || req.body.id == null) {
				this.reject('Invalid object', 400);
				return;
			}
			EntityStore[req.body.id] = req.body;
			this.resolve('ok');
		},
		'$patch /:id': function(req, res, params){
			var obj = EntityStore[params.id];
			if (obj == null) {
				this.reject('NotFound', 404);
				return;
			}
			if (req.body == null) {
				this.reject('Invalid object', 400);
				return;
			}
			mask.obj.extend(obj, req.body);
			this.resolve('ok');
		}
	});
	
}());