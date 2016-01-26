var form_append;
(function(){
	form_append = function (form, mix, name = '') {
		var data = obj_toFlatObject(mix, name);
		for(var key in data){
			var filename = null;
			var val = data[key];

			if (typeof val === 'object' && val.fileName) {
				filename = val.fileName;
			}
			if (filename != null) {
				form.append(key, val, filename);
				continue;
			}
			form.append(key, val);
		}
	};
}());