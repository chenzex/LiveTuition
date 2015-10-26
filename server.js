// var express = require('express');
// var app = express();

// app.use(express.static(__dirname + '/public'));

// var ipaddress = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
// var port = process.env.OPENSHIFT_NODEJS_PORT || 3000;

// var http = require('http').Server(app);
// var io = require('socket.io')(http);

var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require("socket.io").listen(server);

app.configure(function () {
  app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 3000);
  app.set('ipaddr', process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1");
  app.use(express.static(__dirname + '/public'));
});



server.listen(app.get('port'), app.get('ipaddr'), function () {
  console.log('Express server listening on  IP: ' + app.get('ipaddr') + ' and port ' + app.get('port'));
});


var onlineUsers = {};

io.on('connection', function (socket) {
  console.log('a user connected');
  socket.on('disconnect', function () {
    delete onlineUsers[socket.id];
    var msg2 = {
      type: 'refresh',
      onlineUsers: onlineUsers
    }
    io.sockets.emit('user', msg2);
    console.log('user disconnected');
  });
  socket.on('user', function (msg) {
    if (msg.type == 'guestLogin') {
      var user = msg.user;
      user.connId = socket.id;
      onlineUsers[socket.id] = user;
      var msg2 = {
        type: 'refresh',
        onlineUsers: onlineUsers
      }
      socket.emit('user',{
        type: 'login',
        connId: socket.id,
        onlineUsers: onlineUsers
      });
      socket.broadcast.emit('user', msg2);
    }else if(msg.type == 'request'){
      var msg2 = msg;
      msg2.sourceId = socket.id;
      io.sockets.connected[msg.targetId].emit("user", msg2);
    }else if(msg.type == 'group'){
      var msg2 = {
        type : 'group',
        targetId : socket.id
      }
      io.sockets.connected[msg.targetId].emit("user", msg2);
      
    }
  });
  socket.on('chat', function (msg) {
    io.sockets.connected[msg.targetId].emit('chat', msg);
  });
  socket.on('trace', function (trace) {
    io.sockets.connected[trace.targetId].emit('trace', trace);
  });
  socket.on('webrtc', function (msg) {
    var msg2;
    if (msg.type == 'request') {
      msg2 = {
        type: 'request',
        name: msg.name
      }
    } else if (msg.type == 'accept') {
      msg2 = {
        type: 'accept'
      }
    } else if (msg.type == 'close') {
      msg2 = msg;
    } else if (msg.type == 'webrtc') {
      msg2 = msg;
    }
    io.sockets.connected[msg.targetId].emit('webrtc', msg2);
  });
});
//http.listen(port, ipaddress);