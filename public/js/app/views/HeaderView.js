/*
	HeaderView is responsible for displaying the header. At render time, it 
	accepts an optional options dictionary.
*/

define(['jquery', 'underscore', 'backbone', 'handlebars', 'text!templates/hbs/header.hbs'],

	function($, _,  Backbone, Handlebars, headerTemplate){
		var Header = Backbone.View.extend({
			el: $('.main-nav'),
			initialize:function(){
				_.bindAll(this, 'render', 'generateCityData');
				
			},
			render: function(options){
				$(this.el).empty();
				$(this.el).removeAttr('style');
				var cityData = {cities:this.generateCityData(["Boston", "New York", "San Francisco", "Chicago", "Atlanta"])};
				var compiledTemplate = Handlebars.compile(headerTemplate);
				$(this.el).html(compiledTemplate(cityData));
								
				if(options && options.hasOwnProperty("styles")){
					for(var style in options["styles"]){
						$(this.el).css(style, options["styles"][style]);
					}
				}
				return this;
			},
			generateCityData: function(cities){
				/*
					Takes an array of cities and generates an array of objects with each city
					and a relative url for that city starting at 10:00am three days from the 
					current date to 10:00am ten days from the current date.
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
							
				return _.map(cities, function(city){
					return {
						city: city,
						href: "#/cars?dest="+city+"&startdate="+fromMonth+"/"+fromDay+"/"+fromYear+"\
								&enddate="+toMonth+"/"+toDay+"/"+toYear+"&pickuptime=10:00&dropofftime=10:00"
					};
				});				
				
			
			},
			
			destroy: function(){
				//this.remove(); //removes the element and event listeners from the dom via jQuery
				this.unbind(); //removes Backbone  event listeners
			}
		});
		
		return Header;
	}
);