/*eslint-env node*/
var Credentials = require('./credentials');
var credentials = Credentials.get();

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');
// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// create a new express server
var express = require('express');
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

// Serve files from ./public
app.use(express.static('public'));

// start server on the specified port and binding host
server.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
    console.log("server starting on " + appEnv.url);
});


var mysql = require('mysql');
var connection = mysql.createConnection({
    host     : credentials.mysqlhost,
    user     : credentials.mysqluser,
    password : credentials.mysqlpass,
    database : credentials.mysqldb
});

var desktopTopList;
var mobileTopList;

connection.query("DELETE FROM alphabeat WHERE username='Jokke' AND device='mobile'", function(err){
    if(err){
        console.log(err);
    }
})

function getDataInterval(){ 
    var word = 'abcdefghijklmnopqrstuvwxyz';
    
    connection.query("SELECT * FROM alphabeat WHERE word='"+word + "' AND device='mobile' ORDER BY score ASC LIMIT 10;", function(err, rows, fields) {
      if (err){
          console.log(err);
        }

        mobileTopList = rows;
        console.log('Got latest mobile toplist');
    });
    
    connection.query("SELECT * FROM alphabeat WHERE word='"+word + "' AND device='desktop' ORDER BY score ASC LIMIT 10;", function(err, rows, fields) {
      if (err){
          console.log(err);
        }

        desktopTopList = rows;
        console.log('Got latest desktop toplist');
    });

    setTimeout(getDataInterval, 30000);

}

getDataInterval();


io.on('connection', function(client){
    console.log(client.id, 'connnected');
    client.emit('toplists', {
        'desktopTopList': desktopTopList,
        'mobileTopList': mobileTopList
    });
    client.on('event', function(data){});
    client.on('disconnect', function(){
        console.log(client.id, 'disconnected')
    });
    client.on('won', function(data){
        console.log(data);
        
        connection.query("INSERT INTO alphabeat (username, score, device, word) VALUES('"+data[0]+"', "+data[1]+", '"+data[2]+"', '"+data[3]+"');", function(err) {
          if (err){
              console.log(err);
            }else{
                console.log('added');
            }
        });
        
    })
});


app.get('/getResults/:word/:device', function(req, res){
    var word = req.params.word;
    var device = req.params.device;
    if(device!='mobile' && device!='desktop'){
        res.end('You are not welcome here.');
    }else{
        connection.query("SELECT * FROM alphabeat WHERE word='"+word + "' ORDER BY score ASC LIMIT 10;", function(err, rows, fields) {
          if (err){
              console.log(err);
            }
            res.send(rows);
        });
    }

});
