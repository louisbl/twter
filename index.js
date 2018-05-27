const http = require("http");
const io = require("socket.io");
const fs = require("fs");
const TwitterStream = require('./TwitterStream')
const { Transform, Writable } = require('stream')
const server = http.createServer();
const socketIo = io(server);
var feed = null;

const cfg = {
	consumer_key: 'wUlJSeBXH7hGzrV20BE00KYDY',
	consumer_secret: 'qUqevGlqQFFihwwC239CdrTgVvThp0XQDcxn1TAzQiKA5ruaPd',
	access_token_key: '3012100342-HAgWAGqNfhYqwBcHYcBXpVc3SPb2SQwnZE71isa',
	access_token_secret: 'IDAeU4tQyaMBoHZ4nGgtbL4ar87SaI5M1NDo1kqpEN1wr'
};

const socketStream = new Writable({
	objectMode: true,

	write (tweet, _, callback) {
		socketIo.emit('tweet', tweet);
		callback();
	}
})

server.listen(5000);

server.on("request", (request, response) => {
	if(request.url === '/'){
		const fileSrc = fs.createReadStream('./index.html');
		fileSrc.pipe(response);
	}
});

socketIo.on("connection", socket => {
	socket.emit('connected', 'connected');

	socket.on('changeSearchTerms', function (data) {
		if(feed == null){
			console.log('feed set')
			feed = new TwitterStream(cfg, data)

			feed.pipe(socketStream);
		} else {
			test = data
			feed.destroy()
			setTimeout(function(){
				feed = new TwitterStream(cfg, data)
				feed.pipe(socketStream);
				feed.stream.on('error', function(error){
					socketIo.emit('error', error)
				})
			}, 1000)
			console.log('data changed')
		}


	});
});
