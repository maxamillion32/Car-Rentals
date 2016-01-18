// DesktopRouter.js
// ----------------
define(["jquery", "backbone","views/Home", "views/CarListView", "views/CarDetailView", "collections/CarCollection"],

    function($, Backbone, Home, CarListView, CarDetailView, CarCollection) {

        var DesktopRouter = Backbone.Router.extend({

            initialize: function() {
            
            	this.currentView = null;
            	
				Backbone.pubSub.on('search:success', function(payload){ //when user performs a search via form
					
					//update the state of the address bar without triggering route function
					this.navigate('/cars?'+payload.queryString, {trigger:false}); 
					
					//manually refresh state of app, should abstract out of the router in a larger application
					
					var newCollection = new CarCollection();
					newCollection.reset(payload.searchResults);
					
					var carListView = new CarListView({collection:newCollection, queryString:payload.queryString});
            		this.transitionTo(carListView);
					
				}, this);
				
				
				Backbone.pubSub.on('carResult:selected', function(payload){
					
					//update the state of the address bar without triggering route function
					this.navigate('/cars/'+payload.model.get("ResultId"), {trigger:false}); 
					
					//manually refresh state of app, should abstract out of the router in a larger application
					var carDetailView = new CarDetailView(payload.model);
            		this.transitionTo(carDetailView);
            		
				}, this);
				
                // Tells Backbone to start watching for hashchange events
                Backbone.history.start();

            },

            // All of your Backbone Routes
            routes: {

                // When there is no hash on the url, the home method is called
                "": "index",
                "cars(?query)": "carListView", //parentheses properly capture the query
                "cars/:resultId": "carDetailView",
                "*notFound": "index" 

            },

            index: function() {
                // Instantiates a new view which will render the header text to the page
                var home = new Home({router:this});
                this.transitionTo(home);

            },
            
            carListView: function(query){
            	//Instantiates CarListView
            	var carListView = new CarListView({collection:null, queryString:query})
            	this.transitionTo(carListView);
            },
            
            carDetailView: function(resultId){
            
            	/**
            	*	Not ideal, but because the Hotwire API  has no way of querying for a listing by id,
            	*	and hard refreshes clear any kind of app state we would try to remember anyways,
            	*	navigating to a Car detail simply redirects the user to a 'default search'.
            	* 	Again, in a larger app, view manipulation logic should be abstracted out of the Router.
            	*/
            
            	var oneDayMs = 1000*60*60*24,
				threeDaysFromNow = new Date(Date.now() + 3*oneDayMs),
				tenDaysFromNow = new Date(Date.now() +10*oneDayMs),
				fromDay = threeDaysFromNow.getDate(),
				fromMonth = parseFloat(threeDaysFromNow.getMonth()) +1,
				fromYear = threeDaysFromNow.getFullYear(),
				toDay = tenDaysFromNow.getDate(),
				toMonth = parseFloat(tenDaysFromNow.getMonth()) +1,
				toYear = tenDaysFromNow.getFullYear();
				
				if(fromDay < 10)
					fromDay = "0"+fromDay;
				
				if(fromMonth < 10)
					fromMonth = "0"+fromMonth;
				
				if(toDay < 10)
					toDay = "0"+toDay;
				
				if(toMonth < 10)
					toMonth = "0"+toMonth;
							
				
				var defaultQuery = "dest=Boston&startdate="+fromMonth+"/"+fromDay+"/"+fromYear+"&enddate="+toMonth+"/"+toDay+"/"+toYear+"&pickuptime=10:00&dropofftime=10:00";		
            	this.navigate('/cars?'+defaultQuery, {trigger:true}); 
            },
            
            transitionTo: function(view){
            	/**
            	* use instead of directly calling render on a view, this gives the currentView 
            	* an opportunity to clean up after itself before going away.
            	*/
            	if(this.currentView)
            		this.currentView.destroy();
            	this.currentView = view;
            	this.currentView.render();
            }

        });

        // Returns the DesktopRouter class
        return DesktopRouter;

    }

);