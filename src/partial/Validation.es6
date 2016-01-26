var Validation;
(function(){
	Validation = {
		process (formCompo) {
			var error;
			compo_walk(formCompo, compo => {
				
				var name = compo.compoName;
				if (name === ':dualbind' || name === 'dualbind') {
					error = compo.provider.validate();
					if (error) {
						return { 'break': true };
					}
				}
				
				var fn = compo.validateUi || compo.validate;
				if (fn != null) {
					error = fn.call(compo);
					if (error) {
						return { 'break': true };
					}
				}
			});
			return error;
		}
	}
}());