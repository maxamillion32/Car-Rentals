// DesktopInit.js
// --------------

// Includes Desktop Specific JavaScript files here (or inside of your Desktop router)
require(["jquery", "underscore", "backbone", "routers/DesktopRouter"],

  function($, _, Backbone, DesktopRouter) {
	
	//Extend Backbone with a global Pub/Sub Mechanism
	Backbone.pubSub = _.extend({}, Backbone.Events);
		
    // Instantiates a new Desktop Router instance
    new DesktopRouter();

  }

);