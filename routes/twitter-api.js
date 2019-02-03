let { apiCatch, apiSend, genTwit, restoreSession, validateSession } = require('../helpers');
let express = require('express');
let router = express.Router();

let twit;
const PROGRESS_LIST_SLUG = 'tokimeki-test4';

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
  twit.post('lists/members/create', {
    list_id: req.body.list_id,
    user_id: req.body.user_id
  }).catch(e => apiCatch(e))
    .then(result => {
    apiSend(res, result);
  });
});

router.get('/data/user/pics', (req, res) => {
  console.log('getting pics', 
  twit.post('users/lookup', {
    user_id: req.body.user_ids.reverse().slice(0,100).join(','),
    include_entities: false
  }).catch(e => apiCatch(res, e))
    .then(result => {
    apiSend(res, result, {
      pics: result.data.users ? 
        result.data.users.map(user => user.profile_image_url_https) : []
    });
  });
});

router.get('/data/ratelimit', (req, res) => {
  twit.get('application/rate_limit_status', {
    resources: "friendships, user, statuses"
  }).catch(e => apiCatch(res, e))
    .then(result => {
    res.send(result);
  })
});

router.get('/data/delete_progress_lists', (req, res) => {
  twit.get('lists/ownerships', {
    owner_id: req.session.userId,
    count: 1000
  }).catch(e => apiCatch(res, e))
    .then(result => {
      let toDelete = result.data.lists.filter(list =>  {
        return list.slug.indexOf('tokimeki') > -1
      }).map(list => {
        return twit.post('lists/destroy', {
          list_id: list.id_str,
          slug: list.slug
        });
      });
      if (toDelete.length == 0) {
        res.send({
          status: 404,
          message: 'No lists found to delete',
          lists_found: result.data.lists.map(list => list.slug)
        });
        return
      }
    
      console.log('deleting', toDelete.length, 'lists:', toDelete);

      Promise.all(toDelete).catch(e => console.log('error deleting', e))
        .then(result => {
          console.log(result)
          if (result.reduce((prev,r) => prev && r.status == 200 )) {
            res.send({
              status: 200,
              message: 'Deleted lists!',
              lists: result.map(r => r.data.slug)
            })
          }
        });
  });
});

module.exports = router;