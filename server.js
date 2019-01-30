const { apiCatch, restoreSession, validateSession } = require('./helpers');
const express = require('express');
const session = require('cookie-session');
const LoginWithTwitter = new (require('login-with-twitter'))({
  consumerKey: process.env.KEY,
  consumerSecret: process.env.SECRET,
  callbackUrl: 'https://tokimeki-unfollow.glitch.me/auth/twitter/callback' 
});

const app = express();
app.use(express.static('public'));
app.use(express.json()); // handle parsing json data from requests
app.use(session({
  name: 'session',
  secret: 'keyboard cat',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
}));
app.set('view engine', 'pug');

// Main page
app.get('/', function(req, res) {
  if (validateSession(req.session)) {
    res.redirect('/review');
  } else { res.render('index') }
});

// Review page
// TODO: SHOULD PROB BE THE SAME AS THE MAIN PAGEj
app.get('/review', restoreSession, (req, res) => {
  res.sendFile(__dirname + '/views/review.html');
});

app.use(require('./routes-twitter'));
app.use(require('./auth'));

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});