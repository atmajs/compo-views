var ValidationError = mask.class.createError('ValidationError', {
	constructor (error) {
		if (error != null && typeof error === 'object') {
			this.message = error.message || error.error || String(error);
		}
	},
	message: ''
});