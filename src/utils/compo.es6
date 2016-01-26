var compo_walk;
(function(){
	
	compo_walk = function(root, fn){
		mask.TreeWalker.walk(root, compo => {
			if (compo === root) {
				return;
			}
			return fn(compo);
		});
	};
	
}());