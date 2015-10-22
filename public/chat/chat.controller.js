'use strict';
(function () {
    angular
        .module("FormBuilderApp")
        .controller("ChatController", ChatController);
    function ChatController($scope) {
        $scope.messages = [];
        $scope.socket = io.connect("https://live-chenze.rhcloud.com:8443");
        // $scope.socket = io.connect("localhost:3000");

        $scope.socket.on('chatMsg', function (msg) {
            $scope.messages.push(msg);
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

        $scope.draw = function (trace) {
            $scope.ctx.beginPath();
            $scope.ctx.moveTo(trace.x1, trace.y1);
            $scope.ctx.lineTo(trace.x2, trace.y2);
            $scope.ctx.stroke();
        }




        $(function () {
            var canvas = $('#board');
            $scope.ctx = canvas[0].getContext("2d");

            var Pencil;
            Pencil = (function () {
                function Pencil() {
                    //context.strokeStyle = chalk_color;
                    this.started = false;
                }
                Pencil.prototype.mousedown = function (e) {

                    $scope.lastX = e.x;
                    $scope.lastY = e.y;
                    return this.started = true;
                };
                Pencil.prototype.mousemove = function (e) {
                    if (this.started) {
                        $scope.ctx.beginPath();
                        $scope.ctx.moveTo($scope.lastX, $scope.lastY);
                        $scope.ctx.lineTo(e.x, e.y);
                        $scope.ctx.stroke();
                        var trace = {
                            x1: $scope.lastX,
                            y1: $scope.lastY,
                            x2: e.x,
                            y2: e.y,
                            type: e.type
                        };
                        $scope.lastX = e.x;
                        $scope.lastY = e.y;
                        $scope.sendTrace(trace);
                    }
                };
                Pencil.prototype.mouseup = function (e) {
                    if (this.started) {
                        this.started = false;
                        //return img_update();
                    }
                };
                return Pencil;
            })()


            $scope.pencil = new Pencil();
            function ev_canvas(e) {
                e.x = e.pageX - $(this).offset().left;
                e.y = e.pageY - $(this).offset().top;
                $scope.pencil[e.type](e);
            }

            canvas.mousedown(ev_canvas);
            canvas.mousemove(ev_canvas);
            canvas.mouseup(ev_canvas);

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
                // gotAnswer = false;
                // gotOffer = false;

                // var extraIceServers = [];


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
                    // if (event.candidate) {
                    //     // Let's send it to our peer via SignalR
                    //     //hub.server.webRtcSignal(JSON.stringify({ "candidate": event.candidate }), GroupId);(
                            
                    //     var msg = {
                    //         type: 'webrtc',
                    //         content: JSON.stringify({ "candidate": event.candidate })
                    //     }
                    //     $scope.socket.emit('webrtc', msg);
                    //}
                };

                // New remote media stream was added
                connection.onaddstream = function (event) {
                    // Create a new HTML5 Video element
                    //var newVideoElement = document.createElement('video');
                    //newVideoElement.className = 'video';
                    //newVideoElement.autoplay = 'autoplay';

                    //// Attach the stream to the Video element via adapter.js
                    //attachMediaStream(newVideoElement, event.stream);

                    //// Add the new Video element to the page
                    //document.querySelector('body').appendChild(newVideoElement);

                    var videoElement = document.querySelector('#media');
                    attachMediaStream(videoElement, event.stream);
                };

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
                    msg2 = {
                        type: 'accept'
                    }
                    $scope.socket.emit('webrtc', msg2);
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

                            //// Add the stream to our Video element via adapter.js
                            var videoElement = document.querySelector('#media');
                            attachMediaStream(videoElement, _myMediaStream);
                            _myConnection = _myConnection || _createConnection(null);

                            // Add our stream to the peer connection
                            _myConnection.addStream(_myMediaStream);

                            // Now that we have video, we can make a call
                            //if (isCaller) {
                            //  mediaReady = true;
                            //if (mediaReady && guestMediaReady)
                            sendOffer();
                            //} else {
                            //  hub.server.notifyMediaReady(GroupId);
                            //}
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

        });
    }
})();