var obj_toFlatObject,
	obj_getType,
	obj_clone;
(function(){
	
	obj_getType = function (obj) {
		return Object
			.prototype
			.toString
			.call(obj)
			.replace('[object ', '')
			.replace(']', '')
			;
	};
	
	(function() {
		obj_clone = function (obj) {
			if (obj == null || typeof obj !== 'object') 
				return obj;
			
			var type = obj_getType(obj),
				clone;
			
			if ('Date' === type) {
				return new Date(obj);
			}
			if ('Array' === type) {
				clone = [];
				var i = -1,
					imax = obj.length;
				while(++i < imax){
					clone[i] = obj_clone(obj[i]);
				}
				return clone;
			}
			if ('Object' === type) {
				clone = {};
				for(var key in obj){
					clone[key] = obj_clone(obj[key]);
				}
				return clone;
			}
			return obj;
		};
	}());
	
	obj_toFlatObject = function (mix, prefix, out = {}){
		if (mix == null)
			return out;

		var type = obj_getType(mix);

		if ('Array' === type) {
			mix.forEach(function(x, i){
				obj_toFlatObject(x, prefix + '[' + i + ']', out);
			});
			return out;
		}

		if ('Object' === type) {
			if (prefix) 
				prefix += '.';
		
			var key, x, prop;
			for(key in mix){
				x = mix[key];
				prop = prefix + key;

				if (x == null)
					continue;

				var type = obj_getType(x);
				switch (type) {
					case 'Object':
					case 'Array':
						obj_toFlatObject(x, prop, out);
						continue;
					case 'String':
					case 'Number':
					case 'Boolean':
					case 'Blob':
					case 'File':
						if (prop in out){
							console.warn('ToFormData: Overwrite property', prop);
						}
						out[prop] = x;
						continue;
					case 'Date':
						out[prop] = x.toISOString()
						continue;
					default: 
						console.error('Possible type violation', type);
						out[prop] = x;
						continue;
				}
			}
			return out;
		}

		switch(type) {
			case 'Date':
				mix = mix.toISOString()
				break;
			case 'String':
			case 'Number':
			case 'Boolean':
			case 'Blob':
			case 'File':
				break;
			default:
				console.error('Possible type violation', type);
				break;
		}

		if (prefix in out){
			console.warn('ToFormData: Overwrite property', prefix);
		}
		out[prefix] = mix;
		return out;
	};
	
}());