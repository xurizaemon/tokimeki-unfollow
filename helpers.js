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
  console.log('Error caught:', e.statusCode, e.code, e.message);
  res.send({
    status: e.statusCode || 500,
    errorCode: e.code,
    error: e.message
  });
}
function apiSend(res, result, customData) {
  if (result === undefined) return;
  let resp = result.resp.toJSON();
  if (resp.statusCode != 200) return;
  res.send({
    status: resp.statusCode,
    errorCode: resp.errorCode,
    error: resp.error,
    data: customData || result.data
  });
}

module.exports = {
  apiCatch,
  apiSend,
  genTwit,
  restoreSession,
  validateSession
};