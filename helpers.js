let Twit = require('twit');

// Middleware to restore Twitter auth session using cookies
function restoreSession(req, res, next) {
  // console.log(req.session);
    
  let sessionHasData = validateSession(req.session);
  // console.log(sessionHasData ? 'cookie session has data' : 'cookie session empty');
  if (!sessionHasData) { return res.redirect('/logout') }
  
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

function genTwit(token, secret) {
  return new Twit({
    consumer_key: process.env.KEY,
    consumer_secret: process.env.SECRET,
    access_token: token,
    access_token_secret: secret
  });
}

function apiCatch(res, e) {
  console.log('Error caught:', e.code, e.stack);
  res.send({
    status: 500,
    errorCode: e.code,
    error: e.stack
  });
}

function apiSend(res, result, data) {
  let resp = result.resp.toJSON();
  res.send(Object.assign({
    status: resp.statusCode,
    errorCode: resp.errorCode,
    error: resp.error
  }, data))
  
}

module.exports = { apiCatch, genTwit, restoreSession, validateSession };