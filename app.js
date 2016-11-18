/*eslint-env node*/
var Credentials = require('./credentials');
var credentials = Credentials.get();

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : credentials.mysqlhost,
  user     : credentials.mysqluser,
  password : credentials.mysqlpassword,
  database : credentials.mysqldb
});
 
connection.connect();
 
connection.query('SELECT * FROM alphabeat', function(err, rows, fields) {
  if (err){
      console.log(err)
  }
      
 
  console.log('The solution is: ', rows[0].solution);
});
 
connection.end();

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
