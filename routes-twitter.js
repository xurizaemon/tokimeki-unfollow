let express = require('express');
let twitter = require('twit');
let twit;
let router = express.Router();

// Middleware to restore Twitter auth session using cookies
function restoreSession(req, res, next) {
  // console.log(req.session);
    
  let sessionHasData = validateSession(req.session);
  // console.log(sessionHasData ? 'cookie session has data' : 'cookie session empty');
  if (!sessionHasData) { return res.redirect('/logout') }
  
  twit = new twitter({
    consumer_key: process.env.KEY,
    consumer_secret: process.env.SECRET,
    access_token: req.session.token,
    access_token_secret: req.session.secret
  });
  if (twit === undefined) { return res.redirect('/logout') }
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
router.use('/data', restoreSession);
router.use('/data', (req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

router.get('/data/ratelimit', (req, res) => {
  twit.get('application/rate_limit_status', {
    resources: "friendships, user, statuses"
  }).catch(e => apiCatch(res, e))
    .then(result => {
    console.log(result);
    res.send(result);
  })
});

function apiCatch(res, e) {
  console.log('error', e.stack);
  res.send({
    status: 500,
    errorCode: e.code,
    error: e.stack
  });
}



module.exports = router;