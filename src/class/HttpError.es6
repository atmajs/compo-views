var HttpError = mask.class.createError('HttpError', {
	status: 500,
	message: '',
	constructor (message, status) {
		this.status = status;
		this.message = message
	}
});