/**
*	SearchView is a component view responsible for executing queries and 
*	informing subscribers about the status of queries.
*		
*	At render, it accepts an optional parameters object that expects a "displayMode"
*	which tells it whether to render a vertical or horizontal search form as well as any
*	additional styles to be applied to the root element of the component.
*/

define([
	'jquery', 
	'underscore', 
	'backbone', 
	'handlebars', 
	'datetimepicker',
	'text!templates/hbs/search-horizontal.hbs',
	'text!templates/hbs/search-vertical.hbs',
	'collections/CarCollection'],
	
		function($, _, Backbone, Handlebars, datetimepicker, searchHorizontalTemplate, searchVerticalTemplate, CarCollection){
			var SearchView = Backbone.View.extend({
				el:$('<div id="search-form-wrapper"></div>'),
				initialize:function(){
					_.bindAll(this, 'render', 'search', 'destroy');
				},
				events:{
				'click #search-form-submit': 'search'
				},
				render:function(options){
					//removes any styles associated with the root element
					$(this.el).removeAttr('style');
					
					var compiledTemplate;
					
					//dynamically determine which template to render
					if(!options.hasOwnProperty("displayMode") || options["displayMode"] === "horizontal"){
						compiledTemplate = Handlebars.compile(searchHorizontalTemplate);
					}else{
						compiledTemplate = Handlebars.compile(searchVerticalTemplate);
					}
					
					$(this.el).html(compiledTemplate);
					
					//apply optional styles
					if(options && options.hasOwnProperty("styles")){
						for(var rule in options["styles"]){
							$(this.el).css(rule, options["styles"][rule]);
						}
					}
					
					/* configure datetimepickers */
					
					$(this.el).find('#fromdatetime').datetimepicker({
					step: 30,
					format: 'm/d/Y H:i',
					formatDate:'m/d/Y',
					formatTime: 'H:i',
					roundTime: 'floor',
					onShow: function(){
							var toDate, toTime, fromDate, fromTime, sameDay;
						
							if($('#todatetime').val()){
								var toVals = $('#todatetime').val().split(" ");
								toDate = toVals[0];
								toTime = toVals[1];
							}
						
							if($('#fromdatetime').val()){
								var fromVals = $('#fromdatetime').val().split(" ");
								fromDate = fromVals[0];
								fromTime = fromVals[1];
							}
						
						
							if(toDate === fromDate){
								sameDay = true;
							}else{
								sameDay = false;
							}
												
							var now = new Date(),
							month = parseFloat(now.getMonth())+1,
							day = now.getDate(),
							year = now.getFullYear(),
							hours = now.getHours(),
							minutes = now.getMinutes();
						
							month = String(month).length < 2? "0"+month:month,
							day = day < 10? "0"+day:day, 
							minutes = minutes < 10? "0"+minutes:minutes;
							

							console.log(minutes);
							currentDate = month+"/"+day+"/"+year;
							currentTime = hours+":"+minutes;
							console.log("From:", currentDate, currentTime, toDate, sameDay, toTime);
							
							var minTime; 
							
							if(currentDate === fromDate){
								minTime = 0;
							}else if(fromDate === toDate){
								minTime = toTime; 
							}else{
								minTime = false;
							}
							
							console.log(fromDate + "-----"+toDate);
							console.log(minTime);	
									
							this.setOptions({
								minDate: currentDate,
								minTime: minTime,
								maxDate: toDate?toDate:false
								//maxTime:sameDay && toTime?toTime:false
							});
						},
						onChangeDateTime: function(currentTime, $input){
							if($input.val()){
								console.log(currentTime);
								var values = $input.val().split(" "),
								timeComponents = values[1].split(":");
							
								var newDateTime = values[0]+ " "+timeComponents[0]+":";
							
								if(parseFloat(timeComponents[1]) >= 30){
									newDateTime +="30";
								}else{ 
									newDateTime +="00";
								}
							
								$input.val(newDateTime);
							}
						 }
					}); 
					
					$(this.el).find('#todatetime').datetimepicker({
						step: 30,
						format: 'm/d/Y H:i',
						formatDate:'m/d/Y',
						formatTime: 'H:i',
						roundTime: 'floor',
						onShow: function(){
								
								var toDate, toTime, fromDate, fromTime, sameDay;
						
								if($('#todatetime').val()){
									var toVals = $('#todatetime').val().split(" ");
									toDate = toVals[0];
									toTime = toVals[1];
								}
						
								if($('#fromdatetime').val()){
									var fromVals = $('#fromdatetime').val().split(" ");
									fromDate = fromVals[0];
									fromTime = fromVals[1];
								}
						
						
								if(toDate === fromDate){
									sameDay = true;
								}else{
									sameDay = false;
								}
								
								console.log("To:", fromDate, fromTime, sameDay);
									
								this.setOptions({
									minDate: fromDate?fromDate:false,
									minTime: sameDay && fromTime? fromTime:false
								});
							},
						 onChangeDateTime: function(currentTime, $input){
						 	if($input.val()){
								console.log(currentTime);
								var values = $input.val().split(" "),
								timeComponents = values[1].split(":");
							
								var newDateTime = values[0]+ " "+timeComponents[0]+":";
							
								if(parseFloat(timeComponents[1]) >= 30){
									newDateTime +="30";
								}else{ 
									newDateTime +="00";
								}
							
								$input.val(newDateTime);
							}
						 }
						});
					
					if(options.queryString){
						var queryComponents = options.queryString
							.match(/=([0-9A-Za-z\/: ])*/g)
							.map(function(string){
								return string.slice(1);
							});
						$(this.el).find('#search-location').val(queryComponents[0]);
						$(this.el).find('#fromdatetime').val(queryComponents[1] +" "+queryComponents[3]);
						$(this.el).find('#todatetime').val(queryComponents[2]+ " "+queryComponents[4]);
						
					}
					
					return this;
				},
				search: function(event){
					/*Initiates a query to the Hotwire API*/
					
					event.preventDefault();
					console.log("firing search start");
					Backbone.pubSub.trigger('search:start', null);
					$('#search-errors').text(""); //clear the error on every new search
					
					var location = $('#search-location').val();
					var toDate, toTime, fromDate, fromTime;
					
					if($('#todatetime').val()){
						var toVals = $('#todatetime').val().split(" ");
						toDate = toVals[0];
						toTime = toVals[1];
					}
				
					if($('#fromdatetime').val()){
						var fromVals = $('#fromdatetime').val().split(" ");
						fromDate = fromVals[0];
						fromTime = fromVals[1];
					}
					
					var queryString = "dest="+location+"&startdate="+fromDate+"&enddate="+toDate+"&pickuptime="+fromTime+"&dropofftime="+toTime;
					var options = {queryString:queryString};
					
					var collection = new CarCollection();
					
					collection.fetch({
						success: $.proxy(function(data, response, options){
							console.log("firing search:complete");
							Backbone.pubSub.trigger("search:complete", {status:"success"});
							Backbone.pubSub.trigger("search:success", {
								queryString: queryString,
								location: location,
								toDate: toDate,
								toTime: toTime,
								fromDate: fromDate,
								fromTime: fromTime,
								searchResults: data
							});
						}, this), 
						error: $.proxy(function(data, response, options){
							Backbone.pubSub.trigger("search:complete", {status:"error"})
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
							$('#search-errors').text(errorMessage);
							
						}, this),
						data: options
					});
				},
				
				destroy: function(){ //cleans up after view
					$('#todatetime').datetimepicker('destroy');
					$('#fromdatetime').datetimepicker('destroy'); //removes the datetimepickers from the dom
					//this.remove(); //removes the element and event listeners from the dom via jQuery
					this.unbind(); //removes Backbone  event listeners
				}
			});
			
			return SearchView;
		}
);