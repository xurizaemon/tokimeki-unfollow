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

function unfollow(userId, callback) {
  console.log('unfollowing');
  post('/data/unfollow', {
    userId: userId
  }, () => callback(userId));
  // fetch('https://tokimeki-unfollow.glitch.me/data/unfollow', {
  //   method: 'POST',
  //   headers: {
  //     'Accept': 'application/json',
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify({
  //     userId: userId
  //   })
  // }).catch(e => console.log('error', e.stack))
  //   .then(res => res.json())
  //   .then(res => {
  //   console.log('unfollow response', res);
  //   if (res.status == 200) {
  //     callback(userId);
  //   }
  // });
}

function addToList(userId, listId) {

}

function keep(userId) {
  
}

function follow(userId) {
  
}

export { unfollow, addToList, keep };