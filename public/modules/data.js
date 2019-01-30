function post(url, obj, callback) {
  fetch('https://tokimeki-unfollow.glitch.me' + url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(obj)
  }).catch(e => console.log('error', e.stack))
    .then(res => res.json())
    .then(res => {
    console.log('response', res);
    if (res.status == 200) {
      callback();
    }
  });
}

// Rate limit is 15/15 min window in docs
// But in testing I unfollowed > 60 ppl no problem
function unfollow(userId, callback) {
  console.log('unfollowing');
  post('/data/unfollow', {
    userId: userId
  }, (res) => callback(userId));
}

function follow(userId, callback) {
  console.log('following');
  post('/data/follow', {
    userId: userId
  }, () => callback(userId));
}

function addToList(userId, listId) {
  post('/data/lists/members/create_all', {
  })
}
function createList(title, isPrivate) {
  post('/data/lists/create', {
    name: name,
    private: isPrivate
  })
}


function getLists(userId) {
  return fetch('https://tokimeki-unfollow.glitch.me/data/lists/ownerships')
    .catch(e => console.log('error', e))
    .then(res => res.json());
}

export { addToList, createList, getLists, unfollow, follow };