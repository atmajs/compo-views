global.mask = require('maskjs');
global.server = require('atma-server');

server.Application({
		configs: null,
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
			pages: {
				'/foo' : {
					template: '/examples/node/layout',
					view: '/examples/node/foo'
				},
                '/bar': {
                    template: '/examples/node/layout',
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
    .done(() => console.log('READY. Port at 5771'))
	.listen()
