// Require.js Configurations
// -------------------------
require.config({

  // Sets the js folder as the base directory for all future relative paths
  baseUrl: "./js/app",

  // 3rd party script alias names (Easier to type "jquery" than "libs/jquery, etc")
  // probably a good idea to keep version numbers in the file names for updates checking
  paths: {

      // Core Libraries
      // --------------
      "jquery": "../libs/jquery",

      "jqueryui": "../libs/jqueryui",

      "jquerymobile": "../libs/jquery.mobile",

      "underscore": "../libs/lodash",

      "backbone": "../libs/backbone",
      
      "handlebars": "../libs/handlebars-v4.0.5",
      

      // Plugins
      // -------
      "backbone.validateAll": "../libs/plugins/Backbone.validateAll",

      "bootstrap": "../libs/plugins/bootstrap",

      "text": "../libs/plugins/text",

      "jasminejquery": "../libs/plugins/jasmine-jquery",
      
      "datetimepicker": "../libs/plugins/jquery.datetimepicker.full",
      
      "jquery-mousewheel": "../libs/plugins/jquery.mousewheel",
      
      "date-functions": "../libs/plugins/php-date-formatter"

  },

  // Sets the configuration for your third party scripts that are not AMD compatible
  shim: {

      // jQuery Mobile
      "jquerymobile": ["jquery"],

      // Twitter Bootstrap jQuery plugins
      "bootstrap": ["jquery"],

      // jQueryUI
      "jqueryui": ["jquery"],
      
      // Backbone.validateAll plugin that depends on Backbone
      "backbone.validateAll": ["backbone"],

      // Jasmine-jQuery plugin
      "jasminejquery": ["jquery"]

  }

});