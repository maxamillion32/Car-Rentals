/**
*	Home is the top-level view form the index page. 
*	It contains two component views: a SearchView and a loadingScreen
*/

define([

	'jquery', 
	'underscore', 
	'backbone', 
	'handlebars', 
	'text!templates/hbs/home.hbs', 
	'views/HeaderView',
	'views/SearchView',
	'views/LoadingScreenView'], 
	
	function($, _, Backbone, Handlebars, homeTemplate, HeaderView, SearchView, LoadingScreenView){
	
		var Home = Backbone.View.extend({
			el: $('.example'),
		
			initialize: function(){
				_.bindAll(this, 'render', 'destroy'); //ensure proper execution context of functions
				this.subviews = [];
				
				/*
					Home presents a LoadingScreenView when a search begins and removes
					the loading screen when that search completes. The loading screen has
					its own ivar (as opposed to pushing onto this.subviews) for ease of access.
				*/
				
				this.listenTo(Backbone.pubSub, 'search:start', function(payload){
					console.log("home is creating a loading screen");
					this.loadingScreen = new LoadingScreenView({
						"styles":{
							"position":"absolute",
							"top": "35%",
							"left":"45%",
							"color":"#eee"
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
			
			render: function(){
				$(this.el).empty(); //empties '.example'
				var headerView = new HeaderView().render({"styles":{"position":"absolute"}});
				
				var searchView = new SearchView().render({
					"displayMode":"horizontal", 
					"styles":{
						"top":"25%",
						"width":"75%",
						"padding":"1% 1% 0% 1%"
						}
				});
				
				/*
				 //uncomment this block and comment out the block above 
					//to see the vertical search box
					
					var searchView = new SearchView().render({
					"displayMode":"vertical", 
					"styles":{
						"top":"15%",
						"width":"35%",
						"padding":"1% 1% 1% 1%"
						}
				});
				*/
				
				this.subviews.push(headerView);
				this.subviews.push(searchView);
				var compiledTemplate = Handlebars.compile(homeTemplate)();
				$(this.el).html($(compiledTemplate).append($(searchView.el)));
				
				return this;
			},
			
			destroy: function(){
				console.log("Destroying home!");
				
				//Clean up after subviews
				this.subviews.forEach(function(subview){
					subview.destroy();
				});
				
				//Clean up after self
				this.stopListening();
				this.unbind();
				
				//this.remove(); //we want to reuse '.example', so no removing
			}
		
		});
		
		return Home;
		
	}
);