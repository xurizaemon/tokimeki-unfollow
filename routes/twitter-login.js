let express = require('express');
let router = express.Router();

const LoginWithTwitter = new (require('login-with-twitter'))({
  consumerKey: process.env.KEY,
  consumerSecret: process.env.SECRET,
  callbackUrl: `https://${process.env.GLITCH_APP}.glitch.me/auth/twitter/callback`
});

console.log({
  consumerKey: process.env.KEY,
  consumerSecret: process.env.SECRET,
  callbackUrl: `https://${process.env.GLITCH_APP}.glitch.me/auth/twitter/callback`
});

// setup login route to link to with login link on website
router.get('/auth/twitter', (req, res, next) => {
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
router.get('/auth/twitter/callback', (req, res) => {
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

router.get('/logout', (req, res) => {
  delete req.session.userId;
  delete req.session.username;
  delete req.session.token;
  delete req.session.secret;
  res.redirect('/');
});

module.exports = router;