define(['jquery', 'backbone', 'handlebars', 'text!templates/hbs/loadingscreen.hbs'],
	
	function($, Backbone, Handlebars, loadingScreenTemplate){
	
		var LoadingScreenView = Backbone.View.extend({
			el:$('<div class="loading-screen-wrapper">'),
			initialize:function(options){
				_.bindAll(this, 'render', 'destroy');
				if(options){
					for(var style in options.styles){
						$(this.el).css(style, options.styles[style]);
					}
				}
			},
		
			render: function(){
				$(this.el).empty();
				var compiledTemplate = Handlebars.compile(loadingScreenTemplate);
				$(this.el).append(compiledTemplate);
				return this;
			},
		
			destroy: function(){
				this.remove();
				this.unbind();
			}
		});
		
		return LoadingScreenView;
	}
);