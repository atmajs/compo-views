var Builder;
(function(){
	Builder = {
		createMessage (formCompo, params = {}) {
			var body = this.getJson(formCompo),
				contentType = params.contentType || formCompo.xContentType,
				endpoint = params.action || formCompo.xAction,
				method = params.method || formCompo.xMethod;
			
			var key = path_getKey(endpoint);
			if (key) {
				endpoint = path_interpolate(endpoint, body);
				if (body[key] != null) {
					method = params.methodEdit || formCompo.xMethodEdit;
				}
			}
			return new Message(body, {
				contentType,
				endpoint,
				method
			});
		},
		createDeleteMessage (formCompo, model) {
			var endpoint = formCompo.xAction,
				contentType = formCompo.xContentType,
				method = 'DELETE';
			
			var key = path_getKey(endpoint);
			if (key) {
				if (model[key] == null) {
					throw Error('`DELETE` method expects key in the model');
				}
				endpoint = path_interpolate(endpoint, model);
			}
			return new Message(null, {
				contentType,
				endpoint,
				method
			});
		},
		getJson: function(formCompo) {
			var json = obj_clone(getJson(formCompo));
			var transformed = formCompo.transformData(json);
			if (transformed != null) {
				json = transformed;
			}
			return json;
		}
	};
	
	
	function getJson (formCompo) {
		var entity = formCompo.model.entity,
			model = toJson(entity, true),
			data = mask.obj.extend({}, model)
			;
		
		compo_walk(formCompo, compo => {
			var json = toJson(compo, false);
			if (json) {
				var property = compo.attr && compo.attr.property;
				if (property) {
					json = { [property]: json };
				}
				mask.obj.extend(data, json);
				return { deep: false };
			}
		});
		return data;
	}
	
	function toJson(mix, isSelf) {
		if (mix == null) {
			return null;
		}
		var fn = mix.toJson || mix.toJSON;
		if (fn == null) {
			return isSelf ? mix : null;
		}
		return fn.call(mix);
	}
}());