var express = require('express'),
	path = require('path'),
	logger = require('morgan'),
	bodyParser = require('body-parser'),
	neo4j = require('neo4j-driver').v1,
	app = express()

app.set('port', (process.env.PORT || 5000));

// view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(require('./controllers'))

app.listen(app.get('port'), function() {
  console.log('Listening on port 3000...')
})
