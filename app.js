var express = require('express');
const path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const SocketServer = require("ws")
const SocketServerTemp = require("ws");
var http = require("http")
var debug = require('debug')('app4');
var port = process.env.PORT || 3000
var EventEmitter = require("events").EventEmitter
GLOBAL.myEmitter = new EventEmitter();
cont = 0;

var app = express()
var routes = require('./routes/index')

app.set('port', port);

//recibir hmac y id
myEmitter.on('eventHmacAndId', function(hmac, id){
    hmacApp = hmac;
    idApp = id;
});

//----------------------------------------------------------------------------------------WS-------------------

var server = app.listen(app.get('port'), function() {
    debug('Express server listening on port ' + server.address().port);
});

const ws = new SocketServer("ws://serverwss.herokuapp.com/");

ws.onopen = function(){
    console.log("Connection is open...");

    ws.pingssent = 0;
    var interval = setInterval(function() {
        if (ws.pingssent >= 2) {
            ws.close();
        } else {
            ws.ping();
            ws.pingssent++;
            console.log("pin ---->");
        }
    }, 30000);
    ws.on('pong', function() {
        ws.pingssent = 0;
        console.log("<---- pong");
    });
}

ws.onclose = function(){
    console.log("Connection is closed...");
};

ws.onmessage = function (msg) {
  var received_msg = JSON.parse(msg.data);
    if((received_msg.hmac === hmacApp) && (received_msg.key === idApp)){

        setTimeout(function(){

        switch(received_msg.path){

            case '/ack/led/on':
                    myEmitter.emit('ACKLedOn', received_msg);
                    break;
            case '/ack/led/off':
                    myEmitter.emit('ACKLedOff', received_msg);
                    break;
            case '/ack/led/blink':
                    myEmitter.emit('ACKLedBlink', received_msg);
                    break;
            case '/ack/lcd/write/ok':
                    myEmitter.emit('ACKLcdWriteOk', received_msg);
                    break;
            case '/ack/lcd/rgb/ok':
                    myEmitter.emit('ACKLcdRgbOk', received_msg);
                    break;
            case '/ack/buzzer/on':
                    myEmitter.emit('ACKBuzzerOn', received_msg);
                    break;
            case '/ack/buzzer/off':
                    myEmitter.emit('ACKBuzzerOff', received_msg);
                    break;
            case '/ack/temp/on':
                    //myEmitter.emit('ACKTempStart', received_msg);
                    //myEmitter.emit('eventNumberTemp', received_msg);
                    break;
            case '/ack/temp/off':
                    //myEmitter.emit('ACKTempStop', received_msg);
                    break;
            default:
                    myEmitter.emit('ACKError');
                    break;
        }

        },500);
    }
};

ws.onerror = function (errorEvent){
    console.log(errorEvent);
};
/*
const wsTemp = new SocketServerTemp('ws://localhost:5858/');
wsTemp.onopen = function(){
    console.log("Connection is open Temp...");
}

wsTemp.onclose = function(){
    console.log("Connection is closed Temp...");
};

wsTemp.onmessage = function (msg) {
    var received_msg = JSON.parse(msg.data);
        myEmitter.on('eventNumberTemp', function(msg){
        sendMessage(msg);
    });

};*/

myEmitter.on('eventLed', function(msg){
    sendMessage(msg);
});

myEmitter.on('eventHmac', function(msg){
    sendMessageHmac(msg);
});

myEmitter.on('eventWriteLcd', function(msg){
    sendMessageHmac(msg);
});

myEmitter.on('eventBuzzer', function(msg){
    sendMessageHmac(msg);
});

myEmitter.on('eventTemp', function(msg){
    sendMessageHmac(msg);
});

//Funciones envio de mensajes

function sendMessageHmac(msg){
    // Wait until the state of the socket is not ready and send the message when it is...
    waitForSocketConnection(ws, function(){
        console.log("message sent!!!");
        ws.send(msg);
    });
}

function sendMessage(msg){
    // Wait until the state of the socket is not ready and send the message when it is...
    waitForSocketConnection(ws, function(){
        ws.send(msg);
        console.log("message sent!!!");
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
