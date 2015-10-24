'use strict';
(function () {
    angular
        .module("FormBuilderApp")
        .controller("ChatController", ChatController);
    function ChatController($scope) {
        $scope.messages = [];
        // $scope.socket = io.connect("https://live-chenze.rhcloud.com:8443");
        $scope.socket = io.connect("localhost:3000");

        $scope.socket.on('chat', function (chat) {
            chat.self = false;
            $scope.chatGenerator(chat);
        });

        $scope.socket.on('trace', function (trace) {
            $scope.draw(trace);
        });

        $scope.socket.on('webrtc', function (msg) {
            $scope.connect(msg);
        });

        $scope.sendMsg = function () {
            $scope.socket.emit('chatMsg', $scope.chatInput);
            $scope.chatInput = "";
        };

        $scope.sendTrace = function (trace) {
            $scope.socket.emit('trace', trace);
        }






        $(function () {
            function createColorpickers() {
                $('.demo-auto').colorpicker({
                    // input: $('#colorpicker')[0]
                }
                    );
            }
            createColorpickers();


            var canvas = $('#board');
            $scope.ctx1 = canvas[0].getContext("2d");
            $scope.ctx1.lineJoin = $scope.ctx1.lineCap = 'round';
            $scope.ctx2 = $('#board2')[0].getContext("2d");
            $scope.ctx2.lineJoin = $scope.ctx2.lineCap = 'round';
            $scope.ctx3 = $('#board3')[0].getContext("2d");
            $scope.ctx3.lineJoin = $scope.ctx3.lineCap = 'round';

            $('#thickness').slider({
                formatter: function (value) {
                    $scope.ctx1.lineWidth = value;
                    return 'Current value: ' + value;
                }
            });


            var img_update = function () {
                $scope.ctx3.drawImage(canvas[0], 0, 0);
                $scope.ctx1.clearRect(0, 0, canvas[0].width, canvas[0].height);
            };
            var img_update2 = function () {
                $scope.ctx3.drawImage($('#board2')[0], 0, 0);
                $scope.ctx2.clearRect(0, 0, canvas[0].width, canvas[0].height);
            };
            var Pencil, Rect, Line, Eraser;
            var tools = {
                pencil: Pencil = (function () {
                    function Pencil() {
                        //context.strokeStyle = chalk_color;
                        this.points = [];
                        this.started = false;
                    }
                    Pencil.prototype.mousedown = function (e) {
                        this.points.push({ x: e.x, y: e.y });
                        // $scope.ctx1.beginPath();
                        // $scope.lastX = e.x;
                        // $scope.lastY = e.y;
                        // $scope.ctx1.moveTo($scope.lastX, $scope.lastY);
                        this.started = true;
                    };
                    Pencil.prototype.mousemove = function (e) {
                        if (this.started) {
                            $scope.ctx1.strokeStyle = $('#colorpicker')[0].value;

                            this.points.push({ x: e.x, y: e.y });

                            $scope.ctx1.clearRect(0, 0, $scope.ctx1.canvas.width, $scope.ctx1.canvas.height);

                            var p1 = this.points[0];
                            var p2 = this.points[1];

                            $scope.ctx1.beginPath();
                            $scope.ctx1.moveTo(p1.x, p1.y);
                            // console.log(this.points);
                            
                            
                            for (var i = 1, len = this.points.length; i < len; i++) {
                                // we pick the point between pi+1 & pi+2 as the
                                // end point and p1 as our control point
                                var midPoint = {
                                    x: p1.x + (p2.x - p1.x) / 2,
                                    y: p1.y + (p2.y - p1.y) / 2
                                };
                                $scope.ctx1.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
                                // $scope.ctx1.lineTo(p2.x, p2.y);
                                // console.log(p2);
                                p1 = this.points[i];
                                p2 = this.points[i + 1];
                            }

                            $scope.ctx1.lineTo(p1.x, p1.y);
                            $scope.ctx1.stroke();


                            // $scope.ctx1.lineTo(e.x, e.y);
                            // $scope.ctx1.stroke();
                            var trace = {
                                points: this.points,
                                type: e.type,
                                tool: 'pencil',
                                thickness: $scope.ctx1.lineWidth,
                                color: $scope.ctx1.strokeStyle
                            };
                            // $scope.lastX = e.x;
                            // $scope.lastY = e.y;
                            $scope.sendTrace(trace);
                        }
                    };
                    Pencil.prototype.mouseup = function (e) {
                        if (this.started) {
                            this.points.length = 0;
                            this.started = false;
                            img_update();
                            var trace = {
                                type: 'mouseup'
                            };
                            $scope.sendTrace(trace);
                        }
                    };
                    return Pencil;
                })(),
                rect: Rect = (function () {
                    function Rect() {
                        this.started = false;
                    }
                    Rect.prototype.mousedown = function (e) {
                        this.started = true;
                        this.x0 = e.x;
                        return this.y0 = e.y;
                    };
                    Rect.prototype.mousemove = function (e) {
                        var h, w, x, y;
                        if (!this.started) {
                            return;
                        }
                        x = Math.min(e.x, this.x0);
                        y = Math.min(e.y, this.y0);
                        w = Math.abs(e.x - this.x0);
                        h = Math.abs(e.y - this.y0);
                        $scope.ctx1.clearRect(0, 0, canvas[0].width, canvas[0].height);
                        if (!w || !h) {
                            return;
                        }
                        $scope.ctx1.strokeStyle = $('#colorpicker')[0].value;
                        $scope.ctx1.strokeRect(x, y, w, h);
                        var trace = {
                            x: x,
                            y: y,
                            w: w,
                            h: h,
                            type: e.type,
                            tool: 'rect',
                            thickness: $scope.ctx1.lineWidth,
                            color: $scope.ctx1.strokeStyle
                        }
                        $scope.sendTrace(trace);
                    };
                    Rect.prototype.mouseup = function (ev) {
                        this.started = false;
                        img_update();
                        var trace = {
                            type: 'mouseup'
                        };
                        $scope.sendTrace(trace);
                    };
                    return Rect;
                })(),
                line: Line = (function () {
                    function Line() {
                        this.started = false;
                    }
                    Line.prototype.mousedown = function (e) {
                        this.started = true;
                        this.x0 = e.x;
                        return this.y0 = e.y;
                    };
                    Line.prototype.mousemove = function (e) {
                        if (!this.started) {
                            return;
                        }
                        $scope.ctx1.strokeStyle = $('#colorpicker')[0].value;
                        $scope.ctx1.clearRect(0, 0, canvas[0].width, canvas[0].height);
                        $scope.ctx1.beginPath();
                        $scope.ctx1.moveTo(this.x0, this.y0);
                        $scope.ctx1.lineTo(e.x, e.y);
                        $scope.ctx1.stroke();
                        $scope.ctx1.closePath();
                        var trace = {
                            x1: this.x0,
                            y1: this.y0,
                            x2: e.x,
                            y2: e.y,
                            type: e.type,
                            tool: 'line',
                            thickness: $scope.ctx1.lineWidth,
                            color: $scope.ctx1.strokeStyle
                        }
                        $scope.sendTrace(trace);
                    };
                    Line.prototype.mouseup = function (e) {
                        this.mousemove(e);
                        this.started = false;
                        img_update();
                        var trace = {
                            type: 'mouseup'
                        };
                        $scope.sendTrace(trace);
                    };
                    return Line;
                })(),
                eraser: Eraser = (function () {
                    function Eraser() {
                        this.started = false;
                    }
                    Eraser.prototype.mousedown = function (e) {
                        $scope.ctx1.moveTo(e.x, e.y);
                        return this.started = true;
                    };
                    Eraser.prototype.mousemove = function (e) {
                        var hor_offset, ver_offset;
                        if (this.started) {
                            hor_offset = e.x - ($scope.ctx1.lineWidth + 5) / 2;
                            ver_offset = e.y - ($scope.ctx1.lineWidth + 5) / 2;
                            $scope.ctx3.clearRect(hor_offset, ver_offset, $scope.ctx1.lineWidth + 5, $scope.ctx1.lineWidth + 5);
                            var trace = {
                                x1: hor_offset,
                                y1: ver_offset,
                                x2: $scope.ctx1.lineWidth + 5,
                                y2: $scope.ctx1.lineWidth + 5,
                                type: e.type,
                                tool: 'eraser',
                                thickness: $scope.ctx1.lineWidth,
                                color: $scope.ctx1.strokeStyle
                            }
                            $scope.sendTrace(trace);
                        }
                    };
                    Eraser.prototype.mouseup = function (ev) {
                        if (this.started) {
                            this.started = false;
                            img_update();
                            var trace = {
                                type: 'mouseup'
                            };
                            $scope.sendTrace(trace);
                        }
                    };
                    return Eraser;
                })()
            }


            $scope.tool = new tools['pencil']();
            $scope.tool2 = new tools['pencil']();
            function ev_canvas(e) {
                e.x = e.pageX - $(this).offset().left;
                e.y = e.pageY - $(this).offset().top;
                $scope.tool[e.type](e);
            }

            canvas.mousedown(ev_canvas);
            canvas.mousemove(ev_canvas);
            canvas.mouseup(ev_canvas);

            $('.dropdown-menu li > a').click(function (e) {
                $scope.tool = new tools[this.name]();
                if (this.name == 'pencil') {
                    $('#toolBtn').html("<span class='glyphicon glyphicon-pencil' aria-hidden='true'></span>");

                } else if (this.name == 'rect') {
                    $('#toolBtn').html("<span class='glyphicon glyphicon-unchecked' aria-hidden='true'></span>");

                } else if (this.name == 'line') {
                    $('#toolBtn').html("<span class='glyphicon glyphicon-minus' aria-hidden='true'></span>");

                } else if (this.name == 'eraser') {
                    $('#toolBtn').html("<span class='glyphicon glyphicon-erase' aria-hidden='true'></span>");

                }
            });

            $scope.draw = function (trace) {
                if (trace.type == 'mouseup') {
                    img_update2();
                }
                else if (trace.tool == 'pencil') {
                    $scope.ctx2.clearRect(0, 0, $scope.ctx2.canvas.width, $scope.ctx2.canvas.height);

                    var p1 = trace.points[0];
                    var p2 = trace.points[1];
                    $scope.ctx2.lineWidth = trace.thickness;
                    $scope.ctx2.strokeStyle = trace.color;
                    $scope.ctx2.beginPath();
                    $scope.ctx2.moveTo(p1.x, p1.y);
                    // console.log(this.points);
                            
                            
                    for (var i = 1, len = trace.points.length; i < len; i++) {
                        // we pick the point between pi+1 & pi+2 as the
                        // end point and p1 as our control point
                        var midPoint = {
                            x: p1.x + (p2.x - p1.x) / 2,
                            y: p1.y + (p2.y - p1.y) / 2
                        };
                        $scope.ctx2.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
                        // $scope.ctx1.lineTo(p2.x, p2.y);
                        // console.log(p2);
                        p1 = trace.points[i];
                        p2 = trace.points[i + 1];
                    }

                    $scope.ctx2.lineTo(p1.x, p1.y);
                    $scope.ctx2.stroke();
                    
                    // $scope.ctx1.beginPath();
                    // $scope.ctx1.moveTo(trace.x1, trace.y1);
                    // $scope.ctx1.lineTo(trace.x2, trace.y2);
                    // $scope.ctx1.stroke();
                } else if (trace.tool == 'rect') {
                    $scope.ctx2.lineWidth = trace.thickness;
                    $scope.ctx2.strokeStyle = trace.color;
                    $scope.ctx2.clearRect(0, 0, canvas[0].width, canvas[0].height);
                    $scope.ctx2.strokeRect(trace.x, trace.y, trace.w, trace.h);
                } else if (trace.tool == 'line') {
                    $scope.ctx2.lineWidth = trace.thickness;
                    $scope.ctx2.strokeStyle = trace.color;
                    $scope.ctx2.clearRect(0, 0, canvas[0].width, canvas[0].height);
                    $scope.ctx2.beginPath();
                    $scope.ctx2.moveTo(trace.x1, trace.y1);
                    $scope.ctx2.lineTo(trace.x2, trace.y2);
                    $scope.ctx2.stroke();
                    $scope.ctx2.closePath();
                } else if (trace.tool == 'eraser') {
                    $scope.ctx2.lineWidth = trace.thickness;
                    $scope.ctx3.clearRect(trace.x1, trace.y1, trace.x2, trace.y2);
                }
            }

            $scope.chatGenerator = function (chat) {
                //alert(chat.time);
                
                // <li class="right clearfix">
                //     <span class="chat-img pull-right">
                //         <img src="http://placehold.it/50/FA6F57/fff&text=ME" alt="User Avatar" class="img-circle" />
                //     </span>
                //     <div class="chat-body clearfix">
                //         <div class="header">
                //             <small class=" text-muted">
                //                  <span class="glyphicon glyphicon-time"></span>13 mins ago</small>
                //             <strong class="pull-right primary-font">Bhaumik Patel</strong>
                //         </div>
                //         <p>
                //                     Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur bibendum ornare
                //                     dolor, quis ullamcorper ligula sodales.
                //         </p>
                //     </div>
                // </li>
                var li = document.createElement("li");
                
                li.className += "clearfix";
                var span = document.createElement("span");
                span.className +="chat-img";
                
                var image = document.createElement("img");
                image.setAttribute("alt", "User Avatar");
                image.className +="img-circle";
                
                
                var div1 = document.createElement("div");
                div1.className += "chat-body clearfix";
                var div2 = document.createElement("div");
                div2.className += "header";
                
                var small = document.createElement("small");
                small.className += "text-muted";
                var span2 = document.createElement("span");
                span2.className += "glyphicon glyphicon-time";
                small.appendChild(span2);
                small.innerHTML += chat.time;
                
                var strong = document.createElement("strong");
                strong.className += "primary-font";
                strong.innerHTML += chat.sender;
                
                var p = document.createElement("p");
                p.innerHTML += chat.content;
                
                
                if(chat.self){
                    li.className += " right";
                    span.className += " pull-right";
                    image.setAttribute("src","http://placehold.it/50/FA6F57/fff&text=ME");
                    strong.className += " pull-right";
                }
                else{
                    li.className += " left";
                    span.className += " pull-left";
                    image.setAttribute("src","http://placehold.it/50/55C1E7/fff&text=U");
                    strong.className += " pull-left";
                }
                
                span.appendChild(image);
                div2.appendChild(small);
                div2.appendChild(strong);
                div1.appendChild(div2);
                div1.appendChild(p);
                
                
                li.appendChild(span);
                li.appendChild(div1);
                document.getElementById('chat-ul').appendChild(li);
                
                
     
            }
            var sendChat = function () {
                var chat;
                chat = {
                    content: $('#btn-input').val(),
                    time: new Date().toLocaleTimeString(),
                    sender: 'BunnyQ',
                    self: true
                }
                $scope.chatGenerator(chat);
                $scope.socket.emit('chat', chat);
            }
            $('#btn-chat').click(function(){
                sendChat();
            });

            var _myConnection, // My RTCPeerConnection instance
                _myMediaStream; // My MediaStream instance
                
            function sendOffer() {
                //mediaReady = false;
                //guestMediaReady = false;
                _myConnection.createOffer(function (desc) {
                    // Set the generated SDP to be our local session description
                    _myConnection.setLocalDescription(desc, function () {
                        // And send it to our peer, where it will become their RemoteDescription
                        //hub.server.webRtcSignal(JSON.stringify({ "sdp": desc }), GroupId);
                        var msg = {
                            type: 'webrtc',
                            content: JSON.stringify({ "sdp": desc })
                        }
                        $scope.socket.emit('webrtc', msg);
                    });
                    console.log('sending offer');
                });
            };

            function _createConnection() {
                console.log('creating RTCPeerConnection...');
                var iceServers = {
                    "iceServers": [{
                        "url": "stun:stun.l.google.com:19302"
                    }, {
                            "url": "turn:numb.viagenie.ca",
                            "username": "webrtc@live.com",
                            "credential": "muazkh"
                        }]
                };


                var connection = new RTCPeerConnection(iceServers); // null = no ICE servers
                //connection.iceServers = extraIceServers;
                // A new ICE candidate was found
                connection.onicecandidate = function (event) {
                    if (event.candidate) {
                        // Let's send it to our peer via SignalR
                        //hub.server.webRtcSignal(JSON.stringify({ "candidate": event.candidate }), GroupId);(
                            
                        var msg = {
                            type: 'webrtc',
                            content: JSON.stringify({ "candidate": event.candidate })
                        }
                        $scope.socket.emit('webrtc', msg);
                    }
                };

                // New remote media stream was added
                connection.onaddstream = function (event) {

                    // var newVideoElement = document.createElement('video');
                    // newVideoElement.className = 'video';
                    // newVideoElement.autoplay = 'autoplay';

                    
                    // attachMediaStream(newVideoElement, event.stream);

                    
                    // var parent = document.querySelector('#collapseOne');
                    // parent.insertBefore(newVideoElement, parent.childNodes[0]);
   

                    var videoElement = document.querySelector('#media2');
                    attachMediaStream(videoElement, event.stream);
                };

                return connection;
            }

            function _createConnection2(type, iscaller) {
                console.log('creating RTCPeerConnection...');
                var iceServers = {
                    "iceServers": [{
                        "url": "stun:stun.l.google.com:19302"
                    }, {
                            "url": "turn:numb.viagenie.ca",
                            "username": "webrtc@live.com",
                            "credential": "muazkh"
                        }]
                };
                var connection = new RTCPeerConnection(iceServers);
                connection.onicecandidate = function (event) {
                    if (event.candidate) {
                        var msg = {
                            type: 'webrtc',
                            content: JSON.stringify({ "candidate": event.candidate })
                        }
                        $scope.socket.emit('webrtc', msg);
                    }
                };

                // New remote media stream was added
                connection.onaddstream = function (event) {

                    var mediaElement, constrain, msg2;
                    if (type == 'voice') {
                        mediaElement = document.querySelector('#media');
                        constrain = { video: false, audio: true };
                    }
                    else if (type == 'video') {
                        mediaElement = document.querySelector('#media2');
                        constrain = { video: true, audio: true };
                    }

                    if (iscaller == 'true') {
                        msg2 = { type: '' }
                    } else {

                    }
                    attachMediaStream(mediaElement, event.stream);
                };

                getUserMedia(
                // Media constraints
                    constrain,
                    // Success callback
                    function (stream) {


                        _myMediaStream = stream;

                        // var videoElement = document.querySelector('#media');
                        // attachMediaStream(videoElement, _myMediaStream);
                        _myConnection = _myConnection || _createConnection(null);

                        // Add our stream to the peer connection
                        _myConnection.addStream(_myMediaStream);
                        $scope.socket.emit('webrtc', msg2);

                        sendOffer();
                    },
                    // Error callback
                    function (error) {
                        // Super nifty error handling
                        alert(JSON.stringify(error));
                    });

                return connection;
            }


            $scope.connect = function (msg) {
                var msg2;
                if (msg == 'request') {
                    msg2 = {
                        type: 'request'
                    }
                    $scope.socket.emit('webrtc', msg2);
                    console.log("send request");
                } else if (msg.type == "request") {
                    BootstrapDialog.show({
                        title: 'Video Request',
                        message: 'XX is asking for video with you.',
                        buttons: [{
                            label: 'Accept',
                            action: function (dialog) {
                                getUserMedia(
                                    // Media constraints
                                    {
                                        video: true,
                                        audio: true
                                    },
                                    // Success callback
                                    function (stream) {


                                        _myMediaStream = stream;

                                        // var videoElement = document.querySelector('#media');
                                        // attachMediaStream(videoElement, _myMediaStream);
                                        _myConnection = _myConnection || _createConnection(null);

                                        // Add our stream to the peer connection
                                        _myConnection.addStream(_myMediaStream);
                                        msg2 = {
                                            type: 'accept'
                                        }
                                        $scope.socket.emit('webrtc', msg2);

                                        sendOffer();
                                    },
                                    // Error callback
                                    function (error) {
                                        // Super nifty error handling
                                        alert(JSON.stringify(error));
                                    });
                                dialog.close();
                            }
                        }, {
                                label: 'Cancel',
                                action: function (dialog) {
                                    dialog.setMessage('Message 2');
                                }
                            }]
                    });


                    console.log("send accept");
                } else if (msg.type == "accept") {
                    console.log("receive accept");
                    getUserMedia(
                        // Media constraints
                        {
                            video: true,
                            audio: true
                        },
                        // Success callback
                        function (stream) {


                            // Store off our stream so we can access it later if needed
                            _myMediaStream = stream;
                            _myConnection = _myConnection || _createConnection(null);
                            _myConnection.addStream(_myMediaStream);

                            sendOffer();
                        },
                        // Error callback
                        function (error) {
                            // Super nifty error handling
                            alert(JSON.stringify(error));
                        });

                } else if (msg.type == "webrtc") {
                    var message = JSON.parse(msg.content),
                        connection = _myConnection || _createConnection(null);

                    // An SDP message contains connection and media information, and is either an 'offer' or an 'answer'
                    if (message.sdp) {
                        connection.setRemoteDescription(new RTCSessionDescription(message.sdp), function () {
                            if (connection.remoteDescription.type == 'offer') {
                                console.log('received offer, sending answer...');

                                // Add our stream to the connection to be shared
                                //connection.addStream(_myMediaStream);

                                // Create an SDP response
                                connection.createAnswer(function (desc) {
                                    // Which becomes our local session description
                                    connection.setLocalDescription(desc, function () {
                                        // And send it to the originator, where it will become their RemoteDescription
                                        //hub.server.webRtcSignal(JSON.stringify({ 'sdp': connection.localDescription }), GroupId);
                                        msg2 = {
                                            type: 'webrtc',
                                            content: JSON.stringify({ 'sdp': connection.localDescription })
                                        }
                                        $scope.socket.emit('webrtc', msg2);
                                    });
                                }, function (error) { console.log('Error creating session description: ' + error); });
                            } else if (connection.remoteDescription.type == 'answer') {
                                //gotAnswer = true;
                                console.log('got an answer');
                            }
                        });
                    } else if (message.candidate) {
                        // if (!isCaller && !gotOffer) {
                        //     console.log("receive candidates before offer, ask for another offer");
                        //     hub.server.webRtcSignal(JSON.stringify({ 'no_offer': "send another offer" }), GroupId);

                        // } else {
                        console.log('adding ice candidate...');
                        connection.addIceCandidate(new RTCIceCandidate(message.candidate));
                        //}
                        // } else if (message.no_offer) {
                        //     sendOffer();
                        //     console.log("sending another offer");
                        // }

                        _myConnection = connection;
                    }
                }

            }
            _myConnection = _myConnection || _createConnection(null);
        });
    }
})();