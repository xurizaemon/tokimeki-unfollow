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
let token, secret;

const app = express();

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
  callbackURL: '/oauth/callback/twitter'
}, (authToken, authSecret, profile, done) => {
  token = authToken;
  secret = authSecret;
  console.log('token', token);
  console.log('secret', secret);
  console.log('profile', profile);
  return done(null, profile);
}));

// required methods for encoding the user 'profile' object
             // i dont know why this isn't just done for you in passport
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.render('index');
});

app.get('/review', (req, res) => {
  res.render('review', {
    following: [],
  });
});

// setup login route to link to with login link on website
app.get('/login/twitter',
  passport.authenticate('twitter'));

// callback url, must add this to your app on twitters developer portal
app.get('/oauth/callback/twitter',
  passport.authenticate('twitter', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/review');
  });

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
