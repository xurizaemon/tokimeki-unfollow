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

// setup login route to link to with login link on website
app.get('/auth/twitter', (req, res, next) => {
  LoginWithTwitter.login((err, tokenSecret, url) => {
    if (err) {
      console.log(err);
      return next(err);
    }
    req.session.oauthTokenSecret = tokenSecret;
    // Redirect to callback URL with query params
    res.redirect(url);
  });

});

// callback url, must add this to your app on twitters developer portal
app.get('/auth/twitter/callback', (req, res) => {
  console.log('callback', req.query);
  LoginWithTwitter.callback({
    oauth_token: req.query.oauth_token,
    oauth_verifier: req.query.oauth_verifier
  }, req.session.oauthTokenSecret, (err, user) => {
    if (err) {
      console.log('failed twitter login', err);
      res.redirect('/');
    }
    delete req.session.oauthTokenSecret;
    console.log('user callback', user);
    req.session.userId = user.userId;
    req.session.username = user.userName;
    req.session.token = user.userToken;
    req.session.secret = user.userTokenSecret;
    res.redirect('/review');
  });  
});

app.get('/logout', (req, res) => {
  delete req.session.userId;
  delete req.session.username;
  delete req.session.token;
  delete req.session.secret;
  res.redirect('/');
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});