var Message = mask.class.create({
	body: null,
	headers: null,
	method: 'POST',
	endpoint: window.location.href,
	contentType: 'application/json',
	
	constructor (body, params = {}) {
		this.body = body;
		this.headers = params.headers;
		
		if (params.endpoint   ) this.endpoint    = params.endpoint   ;
		if (params.method     ) this.method      = params.method     ;
		if (params.contentType) this.contentType = params.contentType;
	},
	
	get formData () {
		var form = new global.FormData;		
		form_append(form, this.body);
		return form;
	},
	serializeHeaders () {
		var obj = {};
		if (this.isFormData_() === false) {
			obj['Content-Type'] = this.contentType;
		}
		return mask.obj.extend(obj, this.headers);
	},
	serialize () {
		if (this.body == null) {
			return null;
		}
		if (this.isFormData_()) {
			return this.formData;
		}
		return JSON.stringify(this.body);
	},
	
	isFormData_ () {
		return /form-data/i.test(this.contentType)
	}
});