/*
*	CarResultsView is responsible for rendering listing search results. It accepts an options object
*	at initialization that can include a collection to render and an error message. 
*/

define(['jquery', 'underscore', 'backbone', 'handlebars', 'text!templates/hbs/carresults.hbs', 'views/CarDetailView', 'collections/CarCollection'], 
	
	function($, _, Backbone, Handlebars, carResultsTemplate, CarDetailView, CarCollection){
		var CarResults = Backbone.View.extend({
			el:$("<div id='car-results' class='col-md-7'></div>"),
			events:{
				'click .car-listing-link': 'selectedResult'
			},
			initialize: function(options){
				_.bindAll(this, 'render', 'updateResults', 'selectedResult');
				this.collection = options.collection?options.collection: new CarCollection();
				this.errorMessage = options.errorMessage;
				this.listenTo(Backbone.pubSub, 'carList:updatedCollection', this.updateResults);
				
			},
			render: function(){
				$(this.el).empty();
				var t = {cars: this.collection.toJSON(), errorMessage: this.errorMessage};
				var compiledTemplate = Handlebars.compile(carResultsTemplate);
				$(this.el).append(compiledTemplate(t));
				
				return this;
			},
			updateResults: function(options){
				/*
					Causes the view to be re-rendered. If a new collection is passed to the view,
					the new collection is set as CarResultView's collection. Useful for filtering.
				*/
				
				if(options.collection)
					this.collection = options.collection;
					
				this.render();
			},
			selectedResult: function(event){
				/*
					Informs subscribers that the user has selected a car from the result list
					by trigger an event on the global pub/Sub object and passes in the selected
					car as its payload.
				*/
				event.preventDefault();
				var resultid = $(event.currentTarget).find("input[type=hidden]").val();
            	var car = _.find(this.collection.toArray(), function(model){
					return model.get('ResultId') === resultid;
				}); 
				Backbone.pubSub.trigger("carResult:selected", {model:car});
				
			},
			destroy: function(){
				this.unbind();
				this.stopListening();
				this.remove();
			}
			
		
		});
		
		return CarResults;
	}
);