var Transport;
(function(){
	Transport = {
		getJson (url) {
			return new Xhr(url, 'GET').send();
		},
		getGetterEndpoint (formCompo, model) {
			var xGet = formCompo.xGet;
			var endpoint = xGet === 'get' || xGet === true
				? formCompo.xAction
				: xGet;
			
			return path_interpolate(endpoint, model);
		},
		send (message) {
			var { endpoint, method  } = message;
			var body = message.serialize();
			var xhr = new Xhr(endpoint, method);
						
			return xhr
				.write(message.serialize())
				.writeHeaders(message.serializeHeaders())
				.send()
				;
		}
	};
	
}());