'use strict';

const express = require('express');
const SocketServer = require('ws').Server;
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  //.use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const wss = new SocketServer({ server });

router.get('/server', function(req, res, next) {
  

wss.on('connection', function(ws) {

console.log('Cliente conectado...');

      ws.on('message', function(message) {

          wss.clients.forEach((client) => {
            client.send(message);
          });
      });
      
      ws.on('close', function() {
        console.log('Cliente desconectado...');
      });
    });
  
});
