// server.js
// where your node app starts

// init project
// install modules 'npm install'
// also, install pug for templating
const express = require('express');
const passport = require('passport');
let {Strategy} = require('passport-twitter');
const session = require('cookie-session');
const twitter = require('twit');

// Temp holder vars we need to store in session
let token, secret, profile, twit;

const app = express();
// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
// setup passport and session manager
app.use(session({
  name: 'session',
  secret: 'keyboard cat',
  maxAge: 24 * 60 * 60 * 1000
}));
app.use(passport.initialize());
app.use(passport.session());
app.set('view engine', 'pug');


// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// Set up oauth
passport.use(new Strategy({
  consumerKey: process.env.KEY,
  consumerSecret: process.env.SECRET,
  callbackURL: 'https://tokimeki-unfollow.glitch.me/auth/twitter/callback'
}, (authToken, authSecret, resprofile, done) => {
  token = authToken;
  secret = authSecret;
  profile = resprofile._json
  console.log('token', token);
  console.log('secret', secret);
//  console.log('profile', profile);
  return done(null, profile);
}));

// required methods for encoding the user 'profile' object
             // i dont know why this isn't just done for you in passport
passport.serializeUser((user, done) => {done(null, user)});
passport.deserializeUser((obj, done) => {done(null, obj)});

function restoreSession(req) {
  console.log(req.session ? 'session exists' : 'session missing');
  console.log('twit', twit ? 'present' : 'missing')
  if (req.session.auth === undefined &&
     token !== undefined &&
     secret !== undefined) {
    req.session.token = token;
    req.session.secret = secret;
  }
  if (req.session.auth &&
      twit === undefined) {
    twit = new twitter({
      consumer_key: process.env.KEY,
      consumer_secret: process.env.SECRET,
      access_token: token,
      access_token_secret: secret
    });
    console.log(twit ? 'twit restored' : 'twit restore failed');
  }
}

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.render('index');
});

app.get('/review', (req, res) => {
  restoreSession(req);
  if (twit === undefined) res.redirect('/')
  twit.get('friends/list',
  console.log(
  res.render('review', {
    user: profile
  });
});

// setup login route to link to with login link on website
app.get('/auth/twitter',
  passport.authenticate('twitter'));

// callback url, must add this to your app on twitters developer portal
app.get('/auth/twitter/callback', passport.authenticate('twitter',{
  successRedirect: '/review',
  failureRedirect: '/auth/twitter/failure'
}));
        
app.get('/auth/twitter/failure', function(req,res){
  console.log('failed twitter login');
  res.redirect('/');
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
