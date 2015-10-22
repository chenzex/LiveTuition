var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

var ipaddress = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var port = process.env.OPENSHIFT_NODEJS_PORT || 3000;


var http = require('http').Server(app);
var io = require('socket.io')(http);

io.on('connection', function (socket) {
  console.log('a user connected');
  socket.on('disconnect', function () {
    console.log('user disconnected');
  });
  socket.on('chatMsg', function (msg) {
    io.emit('chatMsg', msg);
  });
  socket.on('trace', function (trace) {
    socket.broadcast.emit('trace', trace);
  });
  socket.on('webrtc', function (msg) {
    var msg2;
    if (msg.type == 'request') {
        msg2={
          type : 'request'
        }
    }else if(msg.type == 'accept'){
      msg2={
          type : 'accept'
        }
    }else if(msg.type == 'webrtc'){
      msg2=msg;
    }
    socket.broadcast.emit('webrtc', msg2);
  });
});
http.listen(port, ipaddress);