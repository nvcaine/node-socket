var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var fs = require('fs');

app.listen(8080);

function handler (req, res) {
	fs.readFile(__dirname + '/index.html',

	function (err, data) {
		if (err)
		{
			res.writeHead(500);
			return res.end('Error loading index.html, from dir:' + __dirname);
		}

		res.writeHead(200);
		res.end(data);
	});
}

io.sockets.on('connection', function (socket) {
	socket.emit('news', { text: 'Hello everyone!', username: '*** Server' });

	socket.on('client', function (data) {
		/*if(data.room && data.room != "")
			socket.broadcast.to(data.room).emit('update', {text: data.text, username: data.username});
			// io.sockets.in(room).emit(....)
		else
			socket.broadcast.emit('update', {text: data.text, username: data.username});*/
		socket.get('currentRoom', function (err, currentRoom) {
			if(currentRoom != 'undefined' && currentRoom != null && currentRoom != "")
				socket.broadcast.to(currentRoom).emit('update', {text: data.text, username: data.username + "[" + currentRoom + "]"});
			else
				socket.broadcast.emit('update', {text: data.text, username: data.username});
		});
	});
	
	socket.on('join', function(data) {
		socket.get('currentRoom', function (err, currentRoom) {
			socket.leave(currentRoom);
			socket.broadcast.to(currentRoom).emit('update', {text: data.username + " has left " + currentRoom, username: "*** Server" + "[" + currentRoom + "]"});

			if(currentRoom != 'undefined' && currentRoom != null && currentRoom != "")
				socket.emit('news', {username: '*** Server', text: "You are now leaving [" + currentRoom + "]. See you soon!"});
		});

		socket.set('currentRoom', data.room, function () {
			socket.join(data.room);
			//socket.emit('news', {username: '*** Server', text: "Thank you for joining [" + data.room + "]. Have fun!"});
			socket.broadcast.to(data.room).emit('update', {text: data.username + " has joined " + data.room, username: "*** Server" + "[" + currentRoom + "]"});
		});
		
	});
});