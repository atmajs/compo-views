var path_getCurrent;
(function(){

	path_getCurrent = function(ctx) {
		return mask.obj.get(ctx, 'req.url') || (global.location.pathname + global.location.search);
	};
}());