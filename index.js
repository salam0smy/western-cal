var express = require('express');
var app = express();
var mongoose = require('mongoose');

// connect to the database
var db = mongoose.connect(process.env.MONGOLAB_URI);

//attach lister to connected event
mongoose.connection.once('connected', function() {
	console.log("Connected to database");
});

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

app.get('/', function(request, response) {
  response.send('Hello World!')
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
