// DEPENDENCIES
// ============
var express = require("express"),
	request = require("request"),
	dotenv = require("dotenv").load(),
    http = require("http"),
    port = (process.env.PORT || 8001),
    server = module.exports = express();

// SERVER CONFIGURATION
// ====================
server.configure(function() {

  server.use(express["static"](__dirname + "/../public"));

  server.use(express.errorHandler({

    dumpExceptions: true,

    showStack: true

  }));

  server.use(express.bodyParser())

  server.use(server.router);
  
  server.get('/hotwire', function(req,res){
  	res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.setHeader('Content-Type', 'application/json');
    
    var url = "http://api.hotwire.com/v1/search/car?apikey="+process.env.HOTWIRE_API_KEY+"&format=json";
    
    for(var key in req.query){
    	url +="&"+key+"="+req.query[key];
    }
    
    //sanity check - log raw query and request url
    console.log(req.query);
    console.log(url);
    
    request.get(url, function(err, response, body){
    	if(err)
    		return res.sendStatus(500); //reserved for network errors
    	
    	var json = JSON.parse(body);
    	
    	//log Hotwire API response
    	console.log(json);
    	
    	if(json.StatusCode === "0"){ //very rudimentary error handling via Hotwire statusCodes
    		res.send(body);
    	}else{
    		console.log("error");
    		res.status(400).send(body);
    	}
    })
  })
  
});

// SERVER
// ======

// Start Node.js Server
http.createServer(server).listen(port);

console.log('Welcome to Backbone-Require-Boilerplate!\n\nPlease go to http://localhost:' + port + ' to start using Require.js and Backbone.js');