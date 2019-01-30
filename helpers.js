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

function apiCatch(res, e) {
  console.log('error', e.stack);
  res.send({
    status: 500,
    errorCode: e.code,
    error: e.stack
  });
}

module.exports = { apiCatch, restoreSession, validateSession };