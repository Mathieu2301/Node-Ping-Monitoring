var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 80;

app.use(require('express').static(__dirname + "/"));
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
app.get('/client.js', function(req, res){
  res.sendFile(__dirname + '/client.js');
});

var infos = {
  startDate: Date.now(),
  workingTime: 0,
  player_nbr: 0,
  requests_nbr: 0,
  total_requests_nbr: 0,
}

io.on('connection', function(socket){
  
  console.log("Utilisateur connecté : " + socket.client.id);
  io.local.emit('user-connected', socket.client.id);
++infos.total_requests_nbr;
++infos.requests_nbr;
++infos.player_nbr;
	

  socket.on('disconnect', function(){
    console.log("Utilisateur déconnecté : " + socket.client.id);
    io.local.emit('user-disconnected', socket.client.id);
++infos.total_requests_nbr;
++infos.requests_nbr;
--infos.player_nbr;
  });
  
  socket.on('ping_test', function ( fn ) {
    infos.workingTime = Date.now() - infos.startDate;
++infos.total_requests_nbr;
    fn(infos);
  });
  
  socket.on('infos', function ( data ) {
    console.log(data.msg);
++infos.total_requests_nbr;
++infos.requests_nbr;

	io.local.emit('getdata', {
		id: socket.client.id,
		ping: data.ping
	});
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});