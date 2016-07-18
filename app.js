var express = require('express');
const path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const SocketServer = require("ws")
var http = require("http")
var debug = require('debug')('app4');
var port = process.env.PORT || 3000

var EventEmitter = require("events").EventEmitter
GLOBAL.myEmitter = new EventEmitter()

var app = express()

var routes = require('./routes/index')

app.set('port', port);

//----------------------------------------------------------------------------------------WS-------------------

var server = app.listen(app.get('port'), function() {
  debug('Express server listening on port ' + server.address().port);
});
//const ws = new SocketServer({server: server});
const ws = new SocketServer("https://serverwss.herokuapp.com/");

var message = '{"src" : "D4:B2:54:E2:24:2D", "dst" : "80:C1:45:A5:1B:7F", "path" : "/led/on"}';
ws.onopen = function()
               {

                  console.log("Connection is open...");

            
            }

ws.onmessage = function (msg) 
               { 

                  var received_msg = JSON.parse(msg.data);

                  
                  if(received_msg.dst == "80:C1:45:A5:1B:7F"){
                    console.log("Destination: " + received_msg.dst);
                  }
               };
        
ws.onclose = function()
               { 
                  console.log("Connection is closed..."); 

               };

sendMessage(message);
//Funciones envio de mensajes

function sendMessage(msg){
    // Wait until the state of the socket is not ready and send the message when it is...
    waitForSocketConnection(ws, function(){
        console.log("message sent!!!");
        ws.send(msg);
    });
}

// Make the function wait until the connection is made...
function waitForSocketConnection(socket, callback){
    setTimeout(
        function () {
            if (socket.readyState === 1) {
                console.log("Connection is made")
                if(callback != null){
                    callback();
                }
                return;

            } else {
                //console.log("wait for connection...")
                waitForSocketConnection(socket, callback);
            }

        }, 5); // wait 5 milisecond for the connection...
}

//-------------------------------------------------------------------------------------------------------------------


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
