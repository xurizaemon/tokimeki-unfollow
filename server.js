// server.js
// where your node app starts

// init project
const express = require('express');
const passport = require('passport');
let {Strategy} = require('passport-twitter');
const session = require('cookie-session');
const twitter = require('twit');
const app = express();

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// Set up oauth
passport.use(new Strategy({
  consumerKey: process.env.KEY,
  consumerSecret: process.env.SECRET,
  callbackURL: '/oauth/callback/twitter'
}, (token, secret, profile, done) => {
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
  response.sendFile(__dirname + '/views/index.html');
});

// setup login route to link to 
app.get('/login/twitter',
  passport.authenticate('twitter'));

app.get('/oauth/callback/twitter.com',
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
