/*
 * Events
 *  - start
 *  - error
 *  - progress ('load', percent) ('upload', percent)
 */
export const Xhr = mask.class.create(mask.class.EventEmitter, mask.class.Deferred, {
    constructor(url, method) {
        this.url = url;
        this.method = method;

        this.xhr_ = null;
        this.loadPercent = 0;
        this.uploadPercent = 0;
        this.headers = {};
    },
    write(data) {
        this.data = data;
        if (obj_getType(data) === 'Object') {
            this.data = JSON.stringify(data);
        }
        return this;
    },
    writeHeaders(headers) {
        mask.obj.extend(this.headers, headers);
        return this;
    },
    setEndpoint(url, method) {
        this.url = url;
        this.method = method;
        return this;
    },
    isBusy() {
        return this.xhr_ != null;
    },
    loading_(percent) {
        this.emit('progress', 'load', this.loadPercent = percent);
    },
    uploading_(percent) {
        this.emit('progress', 'upload', this.uploadPercent = percent);
    },
    readResponse_(fn) {
        var xhr = this.xhr_;
        var response = xhr.responseText || '';
        var type = xhr.getResponseHeader('content-type');
        if (type == null) {
            return fn(Error('Content-Type not set'));
        }
        if (/json/i.test(type)) {
            try {
                response = JSON.parse(response);
            }
            catch (error) {
                return fn(Error('Json response malformed: ' + String(error)));
            }
        }

        if (xhr.status === 200) {
            return fn(null, response);
        }
        return fn(this.toError_(xhr, response));
    },
    toError_(xhr, resp) {
        var status = xhr.status,
            message = xhr.responseText || xhr.statusText;
        if (resp != null && typeof resp === 'object') {
            status = resp.status || status;
            message = resp.message || resp.error || message;
        }
        return new HttpError(message, status);
    },
    complete_(error, data) {
        this.loading_(100);
        this.xhr_ = null;
        if (error) {
            this.emit('error', error);
            this.reject(error);
            return;
        }
        this.emit('complete', data);
        this.resolve(data);
    },

    send() {
        if (this.isBusy()) {
            throw Error('Request is not reusable');
        }

        var xhr = this.xhr_ = new XMLHttpRequest();
        xhr.onload = () => {
            this.readResponse_((error, data) =>
                this.complete_(error, data)
            );
        };

        if (xhr.upload) {
            xhr.upload.onprogress = (event) => {

                if (event.lengthComputable) {
                    var loaded = event.loaded,
                        total = event.total,
                        percent = (event.loaded / event.total) * 100 | 0;
                    this.uploading_(percent);
                    return;
                }
                if (this.uploadPercent < 90) {
                    this.uploading_(this.uploadPercent + 10);
                    return;
                }
                this.uploading_(100);
            };
        }

        xhr.open(this.method, this.url);

        for (var key in this.headers) {
            xhr.setRequestHeader(key, this.headers[key]);
        }

        this.emit('start');
        xhr.send(this.data);
        return this;
    }
})
