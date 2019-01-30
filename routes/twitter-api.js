let { apiCatch, apiSend, genTwit, restoreSession, validateSession } = require('../helpers');
let express = require('express');
let router = express.Router();

let twit;
const PROGRESS_LIST_SLUG = 'tokimekitest2'; // TODO update this back to tokimekiunfollow

// Middleware restore session for all /data calls
router.use('/data', restoreSession);
router.use('/data', (req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  twit = genTwit(req.session.token, req.session.secret);
  next();
});

router.get('/data/user', (req, res) => {
  twit.get('users/show', {
   id: req.session.userId
  }).catch((e) => apiCatch(res, e))
    .then((result) => {
    apiSend(res, result);
  });
});

router.get('/data/user/:userId', (req, res) => {
  twit.get('users/show', {
   id: req.params.userId
  }).catch((e) => apiCatch(res, e))
    .then((result) => {
    apiSend(res, result);
  });
});

router.get('/data/tweets/:userId', (req, res) => {
  twit.get('statuses/user_timeline', {
    user_id: req.params.userId,
    count: 50,
    include_rts: true
  }).catch((e) => apiCatch(res, e))
    .then((result) => {
    apiSend(res, result);
  });
});

router.get('/data/friends', (req, res) => {
  twit.get('friends/ids', {
    stringify_ids: true
  }).catch((e) => apiCatch(res, e))
    .then((result) => {
    apiSend(res, result);
  });
});

router.post('/data/unfollow', (req, res) => {
  twit.post('friendships/destroy', {
    user_id: String(req.body.userId)
  }).catch(e => apiCatch(res, e))
    .then(result => {
    apiSend(res, result);
  });
});

router.post('/data/follow', (req, res) => {
  twit.post('friendships/create', {
    user_id: String(req.body.userId)
  }).catch(e => apiCatch(res, e))
    .then(result => {
    apiSend(res, result);
  });
});

/* Lists */
router.get('/data/lists/ownerships', (req, res) => {
  twit.get('lists/ownerships', {
  }).catch(e => apiCatch(e))
    .then(result => {
    apiSend(res, result, {
      lists: result.data.lists.filter(list => list.name !== PROGRESS_LIST_SLUG)
        .map(list => {
          return {
            id_str: list.id_str,
            name: list.name,
            member_count: list.member_count
          }
        })
    });
  });
});

router.post('/data/lists/create', (req, res) => {
  twit.post('lists/create', {
    name: req.body.name,
    mode: req.body.private ? 'private' : 'public',
    description: req.body.description
  }).catch(e => apiCatch(e))
    .then(result => {
    apiSend(res, result);
  });
});

router.post('/data/lists/members/create', (req, res) => {
  twit.post('lists/create', {
    id: req.session.list_id,
    user_id: req.body.user_id
  }).catch(e => apiCatch(e))
    .then(result => {
    apiSend(res, result);
  });
});

/* Saving/Loading Progress as a List */
router.post('/data/save_progress', (req, res) => {
  if (!req.body.user_ids) res.send({ status: 500, error: 'No user ids provided.' });
  let prevMemberCount = 0;
  console.log('saving', req.body.user_ids);

  // SUPPORT MATCHING BY NAME? PULL ALL LISTS AND .FILTER FOR THE ONE WE WANT?
  twit.get('lists/show', {
    slug: PROGRESS_LIST_SLUG,
    owner_id: req.session.userId
  }).catch((e) => {
    if (e.code == 34) {
      console.log('progress list does not exist, creating a new one');
      return twit.post('lists/create', {
        name: PROGRESS_LIST_SLUG,
        mode: 'private',
        description: 'Tracks progress on Tokimeki Unfollow. These are the accounts marked to be kept.'
      }).catch(e => apiCatch(res, e))
    }
  }).then((result) => {
    if (result.data.slug && result.data.slug == PROGRESS_LIST_SLUG) {
      console.log('got list for progress saving, adding members...', result.data)
      return twit.post('lists/members/create_all', {
        slug: PROGRESS_LIST_SLUG,
        owner_id: req.session.userId,
        user_id: req.body.user_ids.join(',')
      });
    } else {
      throw {
        statusCode: 404,
        errorCode: 69,
        error: `Couldn't get list matching slug ${PROGRESS_LIST_SLUG}, got ${result.data.slug} instead.`
      };
    }
  }).catch(e => apiCatch(res, e))
    .then((result) => {
    apiSend(res, result, {
      list_id: result.data.id_str
    });
  });
});

router.get('/data/load_progress', (req, res) => {
  twit.get('lists/members', {
    slug: PROGRESS_LIST_SLUG,
    owner_id: req.session.userId,
    include_entities: false,
    count: 5000
  }).catch(e => apiCatch(res, e)).then(result => {
    apiSend(res, result, {
      user_ids: result.data.users ? 
        result.data.users.map(user => user.id_str) : []
    });
  });
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

module.exports = router;