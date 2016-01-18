define(['jquery', 'backbone', 'models/Car'], 
	
	function($, Backbone, Car){
		
		//New Backbone Collection class with models of type 'Car'
		var CarCollection = Backbone.Collection.extend({
			model: Car,
			parse: function(response){
				var carTypes = response["MetaData"]["CarMetaData"]["CarTypes"]; //array
				carTypes = _(carTypes)
				.indexBy("CarTypeCode")
				.value(); //object mapping each CarTypeCode to its properties
				
				var rentals = response.Result;
				rentals = _(rentals)
				.map(function(car){
					var carTypeCode = car["CarTypeCode"],
					carType = carTypes[carTypeCode];
					
					 //if car has a carType, we will add some additional attributes for filtering
					if(carType){
					
						//adds carType metadata properties to car
						_.extend(car, carType);
						
						//Hotwire API does NOT provide images, so we use our own based on CarTypeCode
						car["imgUrl"] = "img/cars/"+car.CarTypeCode+".jpg";
						
						//extracts number from textual description e.g. '4'
						car["Seats"] = car["TypicalSeating"].split(" ")[0];
						
						//transforms textual description into array of features
						car["PossibleFeaturesList"] = car["PossibleFeatures"]
							.split(",")
							.map(function(feature){
								return feature.trim();
							});
					}
					
					
					car["DailyRateUSD"] = parseFloat(car["DailyRate"]);
					
					//Uses a regex to match either 'Unlimited' or a number of miles per week
					var mileagePerWeek = car["MileageDescription"].match(/(Unlimited)|(\d+) mi \/ week/);
					
					if(mileagePerWeek){
						if(mileagePerWeek[1] != undefined) //captured 'Unlimited'
							car["MileagePerWeek"] = mileagePerWeek[1];
						
						if(mileagePerWeek[2] != undefined) //a mileage per week was captured
							car["MileagePerWeek"] = parseFloat(mileagePerWeek[2]);
					}
					
					return car;
					
				})
				.value();
				
				return rentals;
			},
			fetch: function(options){
			
				/*
					Overriding fetch(); expects an options object containing success and error callbacks,
					and a data object with a queryString property.
				*/
				
				var self = this;
				$.ajax({
					type: "GET",
					url:"http://localhost:8001/hotwire?" + options.data.queryString,
					dataType: "json",
					success: function(data){
						console.log(data);
						if(data.StatusCode === "0")
							options["success"](self.parse(data));
						else
							options["error"](data);
					},
					error: function(xhr){
						options["error"](JSON.parse(xhr.responseText));
					
					}
				});
			},
			
			sync: function(method, collection, options){
				//override this to prevent persistence calls
			}
		});
		
		return CarCollection;
	}
);