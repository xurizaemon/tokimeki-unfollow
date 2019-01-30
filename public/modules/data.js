function post(url, obj, callback) {
  return fetch('https://tokimeki-unfollow.glitch.me' + url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(obj)
  }).catch(e => console.log('error', e.stack))
    .then(res => {
    if (res.status = 200) {
      return res.json()
    } else {
      throw {
        status: res.status,
        statusText: res.statusText
          error: res.error
      }
    }
  })
    .then(res => {
      console.log('response', res);
      if (res.status == 200) {
        return res;
      } else {
        throw {
          status: res.status,
          errorCode: res.errorCode,
          error: res.error
        }
      }
  }).catch(e => console.log('error', e));
}

// Rate limit is 15/15 min window in docs
// But in testing I unfollowed > 60 ppl no problem
function unfollow(userId, callback) {
  console.log('unfollowing');
  post('/data/unfollow', {
    userId: userId
  }).then(res => callback(userId));
}

function follow(userId, callback) {
  console.log('following');
  post('/data/follow', {
    userId: userId
  }).then(res => callback(userId));
}

function addToList(userId, listId) {
  return post('/data/lists/members/createdd', {
    user_id: userId,
    list_id: listId
  })
}
function createList(name, isPrivate) {
  return post('/data/lists/create', {
    name: name,
    private: isPrivate
  });
}


function getLists(userId) {
  return fetch('https://tokimeki-unfollow.glitch.me/data/lists/ownerships')
    .catch(e => console.log('error', e))
    .then(res => res.json());
}

export { addToList, createList, getLists, unfollow, follow };