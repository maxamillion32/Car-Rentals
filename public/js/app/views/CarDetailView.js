/**
*	CarDetailView is the top-level view responsible for displaying detailed information about a car rental.
*	It has three subviews: a headerView, a searchView, and a loadingView.	
*/

define(['jquery', 'underscore', 'backbone', 'handlebars', 'text!templates/hbs/cardetail.hbs', 'views/HeaderView', 'views/SearchView', 'views/LoadingScreenView'],
	
	function($, _, Backbone, Handlebars, carDetailTemplate, HeaderView, SearchView, LoadingScreenView){
		
		var CarDetailView = Backbone.View.extend({
			el:$('.example'),
			initialize: function(model){
				_.bindAll(this, 'render');
				this.model = model;
				this.subviews = [];
				
				/*
					CarDetailView presents a LoadingScreenView when a search begins and removes
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
				
				var headerView = new HeaderView();
				headerView.render();
				this.subviews.push(headerView);
				
				var searchView = new SearchView();
				searchView.render({
				'displayMode':'horizontal',
				'styles':{
					'width':'100%',
					'padding':'1% 1% 0% 1%',
					'border': 'none'
					}
				});
				
				$(searchView.el).appendTo(this.el);
				this.subviews.push(searchView);
				
				var compiledTemplate = Handlebars.compile(carDetailTemplate);
				$(this.el).append(compiledTemplate({car:this.model.toJSON()}));
				
			},
			destroy: function(){
				this.subviews.forEach(function(subview){
					subview.destroy();
				});
				this.unbind();
				this.stopListening();
			}
		});
		
		return CarDetailView;
	}
);