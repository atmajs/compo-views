var img_blobToBase64,
	img_fileToCanvas,
	img_scaleImage,
	img_scaleBlob;

(function(){
	
	img_blobToBase64 = function(blob, cb){
		var reader = new window.FileReader();
		reader.readAsDataURL(blob); 
		reader.onloadend = () => cb(reader.result);
	};
	img_fileToCanvas = function(file, cb){
		var image = new Image;
		image.onload = function(){
			cb(imageToCanvas(image));
		};
		image.src = URL.createObjectURL(file);
	};
	img_scaleBlob = function(blob, w, h, cb){
		blobToCanvas(blob, function(canvas){
			canvas = resizeCanvas(canvas, w, h);
			canvasToBlob(canvas, cb);
		});
	};
	img_scaleImage = function(img, w, h, cb) {
		var canvas = imageToCanvas(img);
		canvas = resizeCanvas(canvas, w, h);
		canvasToBlob(canvas, cb);
	};
	
	function canvasToBlob(canvas, cb) {
		canvas.toBlob(cb, 'image/jpeg', .9);
	}
	function blobToCanvas(blob, cb){
		sourceToCanvas(URL.createObjectURL(blob), cb);
	}
	function sourceToCanvas(src, cb) {
		var image = new Image;
		image.onload = function(){
			cb(imageToCanvas(image));
		};
		image.src = src;
	}
	function imageToCanvas(img, x, y, w, h) {
		if (x == null) {
		  x = 0;
		  y = 0;
		  w = img.width;
		  h = img.height;
		}
		var canvas = document.createElement('canvas');
		canvas.width = w;
		canvas.height = h;
		
		var ctx = canvas.getContext('2d');
		ctx.fillStyle = '#ffffff';
		ctx.fillRect(0,0,w,h);
		ctx.drawImage(
		  img, x, y, w, h, 0, 0, w, h
		);
		return canvas;
	}
	function resizeCanvas(canvas, w, h) {
		var scaled = document.createElement('canvas');
		scaled.width = w;
		scaled.height = h;

		var width = canvas.width,
			height = canvas.height;
		
		var cropW = width,
			cropH = height,
			cropX = 0,
			cropY = 0;

		if (Math.abs(w/h - width/height) > .05) {
			// adjust ratio
			var type;
			if (w > h) {
				cropH = width * h/w;
				if (cropH > height){
					cropH = height;
					cropW = height * w/h;
				}
			}
			if (w < h) {
				cropW = height * w/h;
				if (cropW > width){
					cropW = width;
					cropH = width * h/w;
				}
			}
		}
		cropX = (width - cropW) / 2;
		cropY = (height - cropH) / 2;
		scaled.getContext('2d').drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, w, h);
		return scaled;
	}
}());