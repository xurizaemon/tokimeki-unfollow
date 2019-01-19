// TODO:
// Cache twitter results (clientside using localstorage)

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
let twit;

// Temp holder vars we need to store in session
let token, secret, profile, profileId;
let tempSession = {};

const app = express();
// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
// setup passport and session manager
app.use(session({
  name: 'session',
  secret: 'keyboard cat',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
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
  profile = resprofile._json;
  profileId = profile.id;
  tempSession = {
    token: authToken,
    secret: authSecret,
    profile: resprofile._json,
    profileId: profile.id
  }
  console.log('Oauth complete', tempSession);
//  console.log('profile', profile);
  return done(null, profile);
}));

// required methods for encoding the user 'profile' object
// i dont know why this isn't just done for you in passport
passport.serializeUser((user, done) => {done(null, user)});
passport.deserializeUser((obj, done) => {done(null, obj)});

function validateSession(sess) {
  return ( typeof sess === 'object' &&
    sess.token != undefined &&
    sess.secret != undefined &&
    sess.profile != undefined &&
    sess.profileId != undefined
  );
}

function restoreSession(req, res, next) {
  console.log(req.session);
  // Server temp session should take precedence because it *should* be more recent
  // TODO IMPLEMENT LOGOUT
  let sessionHasData = validateSession(req.session);
  console.log(sessionHasData ? 'cookie session has data' : 'cookie session empty');
  let serverHasData = validateSession(tempSession);
  console.log(serverHasData ? 'server temp session var has data' : 'server temp var empty');
  
  if (sessionHasData || serverHasData
  
  console.log('twit library', twit ? 'present' : 'missing')

  if ((req.session.token === undefined || 
      req.session.secret === undefined) &&
     token !== undefined &&
     secret !== undefined) {
    req.session.token = token;
    req.session.secret = secret;
    console.log('token and secret restored');
  }
  req.session.profileId = profileId ?
    profileId : 
    req.session.profileId;
  if (req.session.token &&
      req.session.secret &&
      twit === undefined) {
    console.log('restoring twit object');
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

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.render('index');
});

app.get('/review', restoreSession, (req, res) => {
  if (twit === undefined) return res.redirect('/')
  res.sendFile(__dirname + '/views/review.html');
});

// Middleware restore session for all /data calls
app.use('/data', restoreSession);
app.use('/data', (req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

app.get('/data/user', (req, res) => {
  if (profile !== undefined) {
    res.send({
      user: profile
    });
  } else {
    twit.get('users/show', {
     id: req.session.profileId
    }).catch((e) => console.log('error', e.stack))
      .then((result) => {
       res.send({
         user: result.data
       });
    });
  }
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
