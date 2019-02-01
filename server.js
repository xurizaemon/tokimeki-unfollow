const { restoreSession, validateSession } = require('./helpers');
const express = require('express');
const session = require('cookie-session');

const app = express();
app.use(express.static('public'));
app.use(express.json()); // Handle parsing json data from requests
app.use(session({
  name: 'session',
  secret: 'keyboard cat',
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
}));
app.set('view engine', 'pug');

// Routes
app.use(require('./routes/twitter-api'));
app.use(require('./routes/twitter-login'));

// Force HTTPS so fetches work
app.enable('trust proxy');
app.use((req, res, next) => {
  if (req.secure) {
    return next();
  }
  res.redirect('https://' + req.headers.host + req.url);
});

// Main page
app.get('/', function(req, res) {
  if (validateSession(req.session)) {
    res.redirect('/review');
  } else { res.render('index') }
});

// Review page
// TODO: SHOULD PROB BE THE SAME AS THE MAIN PAGE
app.get('/review', restoreSession, (req, res) => {
  res.sendFile(__dirname + '/views/review.html');
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});