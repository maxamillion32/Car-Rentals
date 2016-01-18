define(['jquery', 'underscore', 'backbone', 'handlebars', 'jqueryui', 'text!templates/hbs/filter.hbs'],

	function($, _, Backbone, Handlebars, jQueryUI, filterTemplate){
	
		var FilterView = Backbone.View.extend({
			el: $('<div id="filter-menu" class="col-md-3 col-md-offset-1"></div>'),
			initialize: function(){
				_.bindAll(this, 'render');
			},
			
			events:{
				'click #filter-clear': 'clearFilter'
			},
			render: function(){
				var compiledTemplate = Handlebars.compile(filterTemplate);
				$(this.el).html(compiledTemplate);
				
				/*configure sliders*/
				
				$(this.el).find('#slider-price').slider({
					min: 5,
					max: 250,
					range:true,
					step: 5,
					values:[5, 250],
					slide: function(event, ui){
						//update the slider's UI whenever the user slides it
						
						var max = $('#slider-price').slider("option", "max"),
						lower = $('#slider-price-lower'),
						upper = $('#slider-price-upper');
						
						if(ui.values[0] === max){
							lower.text('250+');
						}else{
							lower.text(ui.values[0]);
						}
						
						if(ui.values[1] === max){
							upper.text('250+');
						}else{
							upper.text(ui.values[1]);
						}
					},
					change:function(event,ui){
						//let subscribers know the price filter changed
						Backbone.pubSub.trigger("filter:price", {min:ui.values[0], max:ui.values[1]});
					}
				});
				
				$(this.el).find('#slider-miles').slider({
					min: 500,
					max: 2000,
					range:true,
					step: 50,
					values:[500, 2000],
					slide: function(event, ui){
						//update the slider's UI whenever the user slides it
						
						var max = $('#slider-miles').slider('option', 'max'),
						lower = $('#slider-miles-lower'),
						upper = $('#slider-miles-upper');
						
						if(ui.values[0] === max){
							lower.text('Unlimited');
						}else{
							lower.text(ui.values[0]);
						}
						
						if(ui.values[1] === max){
							upper.text('Unlimited');
						}else{
							upper.text(ui.values[1]);
						}
						
					},
					change: function(event, ui){
						//let subscribers know the price filter changed
						Backbone.pubSub.trigger("filter:miles", {min:ui.values[0], max:ui.values[1]});
					}
				});
				
				/*configure selectmenus*/
				
				$(this.el).find('#selectmenu-seating').selectmenu({
					change: function(event, ui){
						Backbone.pubSub.trigger("filter:seating", {value: ui.item.value});
					}
				});
				$(this.el).find('#selectmenu-model').selectmenu({
					change: function(event, ui){
						Backbone.pubSub.trigger("filter:model", {value: ui.item.value});
					}
				});
				$(this.el).find('#selectmenu-features').selectmenu({
					change: function(event, ui){
						Backbone.pubSub.trigger("filter:features", {value: ui.item.value});
					}
				});
				
				return this;
			},
			
			clearFilter: function(event){
				event.preventDefault();
				this.render(); //re-render to FilterView to reset inital values
				Backbone.pubSub.trigger("filter:clear");
			},
			
			destroy: function(){
				$('#slider-price').slider("destroy");
				$('#slider-miles').slider("destroy");
				$('#selectmenu-seating').selectmenu("destroy");
				$('#selectmenu-model').selectmenu("destroy");
				$('#selectmenu-features').selectmenu("destroy");
				this.unbind();
			}
		});
		
		return FilterView;
	}

);