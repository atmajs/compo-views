global.mask = require('maskjs');
global.logger = require('atma-logger');

var server = require('atma-server');
global.mask.Module.cfg('base', '../../');

server.Application({
		configs: null,
        base: '../../',
		config: {
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
				'!/' : {
					master: 'master',
                    template: 'layout',
					view: '/examples/node/index'
				},
                '/about': {
                    master: 'master',
                    template: 'layout',
					view: '/examples/node/about'
                }
			}
		}
	})
	.processor({
		after: [
			atma.server.middleware.static
		]
	})
	.listen(5777);
