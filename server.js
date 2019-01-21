// TODO:
// http://moonlitscript.com/post.cfm/how-to-use-oauth-and-twitter-in-your-node-js-expressjs-app/

// server.js
// where your node app starts

const fetch = require('node-fetch');
const express = require('express');
const passport = require('passport');
let {Strategy} = require('passport-twitter');
const session = require('cookie-session');
const twitter = require('twit');
const LoginWithTwitter = new (require('login-with-twitter'))({
  consumerKey: process.env.KEY,
  consumerSecret: process.env.SECRET,
  callbackUrl: 'https://tokimeki-unfollow.glitch.me/auth/twitter/callback' 
});
let twit;

const app = express();
app.use(express.static('public'));
app.use(session({
  name: 'session',
  secret: 'keyboard cat',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
}));
app.set('view engine', 'pug');

// Main page
app.get('/', function(request, response) {
  response.render('index');
});

// Review page
// TODO: SHOULD PROB BE THE SAME AS THE MAIN PAGE
app.get('/review', restoreSession, (req, res) => {
  res.sendFile(__dirname + '/views/review.html');
});

// Middleware to restore Twitter auth session using cookies
function restoreSession(req, res, next) {
  console.log(req.session);
    
  let sessionHasData = validateSession(req.session);
  console.log(sessionHasData ? 'cookie session has data' : 'cookie session empty');
  if (!sessionHasData) { return res.redirect('/logout') }
  
  console.log('twit library', twit ? 'present' : 'missing')
  if (req.session.token &&
      req.session.secret &&
      twit === undefined) {
    twit = new twitter({
      consumer_key: process.env.KEY,
      consumer_secret: process.env.SECRET,
      access_token: req.session.token,
      access_token_secret: req.session.secret
    });
  }
  console.log(twit ? 'twit restored' : 'twit restore failed');
  next();
}

function validateSession(sess) {
  return ( typeof sess === 'object' &&
    sess.token !== undefined &&
    sess.secret !== undefined &&
    sess.username !== undefined &&
    sess.userId !== undefined
  );
}

// Middleware restore session for all /data calls
app.use('/data', restoreSession);
app.use('/data', (req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

app.get('/data/user', (req, res) => {
  twit.get('users/show', {
   id: req.session.userId
  }).catch((e) => console.log('error', e.stack))
    .then((result) => {
     res.send({
       user: result.data
     });
  });
});

app.get('/data/user/:userId', (req, res) => {
  twit.get('users/show', {
   id: req.params.userId
  }).catch((e) => console.log('get user error', e.stack))
    .then((result) => {
     res.send({
       user: result.data
     });
  });
});

app.get('/data/tweets/:userId', (req, res) => {
  twit.get('statuses/user_timeline', {
    user_id: req.params.userId,
    count: 5,
    include_rts: true,
    exclude_replies: true
  }).catch((e) => console.log('get tweets error', e.stack))
    .then((result) => {
     res.send({
       tweets: result.data
     });
  });
});

app.get('/data/friends', (req, res) => {
    twit.get('friends/ids', {
      stringify_ids: true
    })
      .catch((e) => console.log('error', e.stack))
      .then((result) => {
       res.send({
         friends: result.data.ids
       });
    });
});

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
  res.r
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});