/**
*	CarListView is the top-level view listings that result from a query to the Hotwire API. 
*		
*	CarListView is responsible for maintaining state information which it passes to subviews 
*			and updating views in response to user interactions, which it determines by subscribing to events.
*		
*	Subviews are solely responsible for displaying information, and publishing events in response to user interactions
*		Subviews of CarListView include: HeaderView, SearchView, FilterView, and CarResultsView
*/

define([
	'jquery', 
	'underscore', 
	'backbone', 
	'handlebars', 
	'models/Car',
	'collections/CarCollection', 
	'text!templates/hbs/carlist.hbs',
	'views/HeaderView',
	'views/FilterView',
	'views/SearchView',
	'views/CarResultsView',
	'views/LoadingScreenView',
	'routers/LocationNavigator'], 
	
	function($, _, Backbone, Handlebars, Car, CarCollection, carListTemplate, HeaderView, FilterView, SearchView, CarResultsView, LoadingScreenView, LocationNavigator){
		
		var CarListView = Backbone.View.extend({
			el: '.example',
			initialize: function(options){
				_.bindAll(this, 'render', 'addPropertyFilter', 'addRangeFilter', 'applyFilters', 'applyRangeFilter', 'applyPropertyFilter', 'clearFilters', 'destroy');
				this.locationNavigator = new LocationNavigator();
				this.queryString = options.queryString;
				this.collection = options.collection? options.collection: new CarCollection();
				this.subviews = [];
				this.filters = {};
				
				this.listenTo(Backbone.pubSub,'filter:price', function(payload){
					this.addRangeFilter("DailyRateUSD", payload.min, payload.max);
				});
				
				this.listenTo(Backbone.pubSub,'filter:miles', function(payload){
					this.addRangeFilter("MileagePerWeek", payload.min, payload.max);
				});
				
				this.listenTo(Backbone.pubSub,'filter:seating', function(payload){					
					this.addPropertyFilter("Seats", payload.value);
				});
				
				this.listenTo(Backbone.pubSub,'filter:model', function(payload){
					this.addPropertyFilter("CarTypeCode", payload.value);
				});
				
				this.listenTo(Backbone.pubSub, 'filter:features', function(payload){
					this.addPropertyFilter("PossibleFeaturesList", payload.value);
				});
				
				this.listenTo(Backbone.pubSub, 'filter:clear', function(){
					this.clearFilters();
				});
				
				this.listenTo(Backbone.pubSub, 'search:start', function(payload){
					console.log("home is creating a loading screen");
					this.loadingScreen = new LoadingScreenView({
						"styles":{
							"position":"absolute",
							"top": "35%",
							"left":"45%"
						}
					});
					this.loadingScreen.render();
					$(this.el).append(this.loadingScreen.el);	
				});
				
				this.listenTo(Backbone.pubSub, 'search:complete', function(payload){
					if(this.loadingScreen){
						this.loadingScreen.destroy();
						this.loadingScreen = null;
					}
				});
				
			},
			
			render: function(options){
				$(this.el).empty();
				var headerView = new HeaderView().render();
				var searchView = new SearchView().render({
					'displayMode':'horizontal',
					'styles':{
						'width':'100%',
						'padding':'1% 1% 0% 1%',
						'border': 'none'
						},
					'queryString':this.queryString
					});
				$(searchView.el).appendTo(this.el);
				var filterView = new FilterView().render();
				$(filterView.el).appendTo(this.el);
				
				this.subviews.push(headerView);
				this.subviews.push(searchView);
				this.subviews.push(filterView);
				
				var carResultsView;
				
				if(this.collection.toArray().length < 1){
					var loadingView = new LoadingScreenView({
						"styles":{
							"position":"absolute",
							"top": "35%",
							"left":"45%"
						}
					}).render();
					$(loadingView.el).appendTo(this.el);
				
					//no collection was given or a collection was given with no models, refresh results
					var newCollection = new CarCollection();
					newCollection.fetch({
						success: $.proxy(function(data, response, options){
							if(!data || Object.keys(data).length === 0){
								//really no results, so display an error
								//$(this.el).append($("<p>").text("No results to display"));
								this.locationNavigator.navigate('https://localhost:8001/'); //proper redirect w/pub-sub to communicate back to router
							}else{
								//new results, refresh the data
								newCollection.reset(data);
								console.log("fetching new results!");
								Backbone.pubSub.trigger('carList:refresh', {searchResults:data});
								this.collection = newCollection;
								
								//render resultsView with new data
								loadingView.destroy();
								carResultsView = new CarResultsView({collection:this.collection}).render();
								$(carResultsView.el).appendTo(this.el);
								this.subviews.push(carResultsView);
							}
						}, this), 
						error: $.proxy(function(data, response, options){
							console.log('error!');
							loadingView.destroy();
							
							var errorMessage = data["StatusDesc"];
							if(data["Errors"].hasOwnProperty("Error")){
								errorMessage+=": "+	data["Errors"]["Error"]["ErrorMessage"];
							}else{
								if(data["Errors"].length > 0){
									errorMessage+=": ";
									data["Errors"].forEach(function(errorObj){
										errorMessage += errorObj["ErrorMessage"] + ", ";
									});
									errorMessage = errorMessage.slice(0,errorMessage.length-2);
								}
							}
							carResultsView = new CarResultsView({collection:null, errorMessage: errorMessage}).render();
							$(carResultsView.el).appendTo(this.el);
							this.subviews.push(carResultsView);
						}, this),
						data: {queryString:this.queryString}
					});
				}else{
					//a collection was given to render with > 0 models
					carResultsView = new CarResultsView({collection:this.collection}).render();
					$(carResultsView.el).appendTo(this.el);
					this.subviews.push(carResultsView);
				}
				
				return this; //makes view chainable
			},
			
			addPropertyFilter: function(property, filterValue, defaultValue){
				//default value specifies the value for which no filters should be applied
				if(!defaultValue)
					defaultValue = 'all';
				delete this.filters[property]; //delete pre-existing filter if any
				if(!(filterValue === defaultValue)) //only add filter, if its not the default
					this.filters[property] = filterValue;
				this.applyFilters();
			
			},
			
			addRangeFilter: function(property, min, max){
				delete this.filters[property]; //we always delete the existing range filter
				this.filters[property] = [min, max]; //and replace it, because the range filter is always applied
				this.applyFilters();
			},
			
			applyFilters: function(){
				/*
					applies filter functions to the CarListView's collection and updates
					the CarResultsView with a filtered copy of the collection. The CarListView's 
					collection is unchanged.
				 */
				 
				var self = this;
				var carsArray = self.collection.toArray();

				for(var filter in self.filters){
					switch(filter){
						case "DailyRateUSD":
							var min = self.filters[filter][0] === 250? "Unlimited": self.filters[filter][0];
							var max = self.filters[filter][1] === 250? "Unlimited": self.filters[filter][1];	
							carsArray = self.applyRangeFilter(carsArray, filter, min, max);
							break;
						case "MileagePerWeek":
							//additional processing may be required
							var min = self.filters[filter][0] === 2000? "Unlimited": self.filters[filter][0];
							var max = self.filters[filter][1] === 2000? "Unlimited": self.filters[filter][1];
							console.log(min, max);
							carsArray = self.applyRangeFilter(carsArray, filter, min, max);
							break;
						case "Seats":
							carsArray = self.applyPropertyFilter(carsArray, filter, self.filters[filter]);
							break;
						case "CarTypeCode":
							var carCodes = self.filters[filter].split(","); //supports car types that map to multiple codes
							carsArray = self.applyMultiFilter(carsArray, filter, carCodes);
							break;
						case "PossibleFeaturesList":
							carsArray = self.applyContainsFilter(carsArray, filter, self.filters[filter]);
							break; 
						default:
							break;
						
					}
				}
				
				var newCollection = new CarCollection();
				newCollection.reset(carsArray);
				Backbone.pubSub.trigger('carList:updatedCollection', {collection: newCollection});
				
			},
			
			applyRangeFilter: function(array, property, min, max){
				//returns a filtered array of items whose property lies within the given range
				return _.filter(array, function(item){
					var itemJson = item.toJSON();
					if(min === "Unlimited" || max === "Unlimited")
						return itemJson[property] >= min || itemJson[property] === "Unlimited";
					else
						return itemJson[property] >= min && itemJson[property] <= max;
				});
				
			},
			
			applyPropertyFilter: function(array, property, value){
				//returns a filtered array of items whose property matches the sought after value
				return _.filter(array, function(item){
					var itemJson = item.toJSON();
					return (itemJson[property] === value);
				});
			},
			
			applyMultiFilter: function(array, property, values){
				//returns a filtered array of items whose property matches one of values in the array of sought after values
				return _.filter(array, function(item){
					var itemJson = item.toJSON();
					var matched = false;
					for(var i=0; i < values.length; i++){
						if(itemJson[property] === values[i])
							matched = true;
					}
					
					return matched;
				});
			},
			
			applyContainsFilter: function(array, property, value){
				//returns a filtered array of items whose property value array contains the specified value
				return _.filter(array, function(item){
					var itemJson = item.toJSON(),
					itemArray = itemJson[property];
					for(var i=0; i < itemArray.length; i++){
						if(itemArray[i] === value)
							return true;
					}
					
					return false;
				});
			},
			
			clearFilters: function(){
				this.filters = {};
				Backbone.pubSub.trigger('carList:updatedCollection', {collection: this.collection});
			},
			destroy: function(){
				console.log("CarListView destroyed");
				this.subviews.forEach(function(subview){
					subview.destroy();
				});
				this.unbind();
				this.stopListening();
			}
			
		});
		
		return CarListView;
	}
);