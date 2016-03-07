global.mask = require('maskjs');
global.logger = require('atma-logger');

var server = require('atma-server');
//global.mask.Module.cfg('base', '../../');

server.Application({
		configs: null,
  //      base: '../../',
		config: {
            debug: true,
            port: 5771,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            env: {
				server: {
					scripts: [ 'lib/views.js' ]
				},
                client: {
					scripts: {
                        bower: [
                                'maskjs',
                                'maskjs/lib/mask.bootstrap.js',
                                'ruta/lib/ruta.js'
                        ],
                        array: [ '/lib/views.js' ],
                    }
				},
			},
			page: {
				location: {
					master: 'examples/node/{0}.mask',
					template: 'examples/node/{0}.mask'
				}
			},
			pages: {
				'/foo' : {
					master: 'master',
                    template: 'layout',
					view: '/examples/node/foo'
				},
                '/bar': {
                    master: 'master',
                    template: 'layout',
					view: '/examples/node/bar'
                }
			}
		}
	})
	.processor({
		after: [
			atma.server.middleware.static.config({
                headers: {
                        'Access-Control-Allow-Origin': '*'
                }
            })
		]
	})
	.listen();
