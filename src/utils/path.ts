
export function path_getCurrent (ctx) {
	return mask.obj.get(ctx, 'req.url') || ruta.currentPath();
};
