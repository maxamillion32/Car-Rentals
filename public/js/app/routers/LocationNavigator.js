/*
	Abstracts out hard-navigation. Would be useful for spoofing tests vs. using window.location.href
*/

define([], 
	
	function(){
		
		var LocationNavigator = function(){
			return {
				navigate: function(url){
					window.location.href = url;
				}
			};
		};
		
		return LocationNavigator;
	}
);