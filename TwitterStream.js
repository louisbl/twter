const Twitter = require('twitter');
const { Readable, Transform } = require('stream');

class TwitterStream extends Readable {

	constructor(cfg, query){
		super({ objectMode: true })
		this.client = new Twitter(cfg);
		this.connect(query);

	}

	_read() {}

	connect(query) {
		var obj = this;

		if(this.stream){
			this.stream.destroy()
		}

		this.stream = this.client.stream('statuses/filter', { track: query});
		this.stream.on('data', function(tweet){
			obj.push(tweet);
		});
		this.stream.on('error', function(error){
			obj.push(error);
		});
	}

}

module.exports = TwitterStream