define(['jquery', 'backbone'], 

	function($, Backbone){
		var Car = Backbone.Model.extend({
			//Constructor function, called exactly once on instantiation
			initialize:function(){
			
			},
			
			//Default values for the Car Model
			defaults:{
			
			},
			fetch: function(options){
				//overrides to do nothing, since Hotwire's api isn't RESTFul i.e. doesn't understand path/car/:id
			}
		});
	
		return Car;
	}
	
);