let store = window.localStorage;

if (invalidateStore(store)) {
  console.log('No valid data in store, fetching from Twitter');
  Promise.all([
    window.fetch('https://tokimeki-unfollow.glitch.me/data/user'),
    window.fetch('https://tokimeki-unfollow.glitch.me/data/friends')
  ]).then(res => Promise.all(res.map(r => r.json())))
    .then(res => {
    console.log(res);
    store.setItem('updated', new Date().toString());
    store.setItem('user',res[0].user);
    store.setItem('friends',res[1].friends);
    render({
      user: res[0].user,
      friends: res[1].friends
    });
  });
} else {
  console.log('Valid data in store');
  render({
    user: store.getItem('user'),
    friends: store.getItem('friends')
  });
}

function invalidateStore(store) {
  console.log('Validating store');
  let updated = store.getItem('updated');
  if (updated === null) { return true }
  if (new Date() - new Date(updated) >
      5 * 60 * 1000) { 
    console.log('More than 5 minutes since last update');
    return true; // More than 5 minutes
  }
  return store.getItem('user') === null ||
    store.getItem('friends') === null
}

function render(res) {
  console.log('Rendering ', res);
  var app = new Vue({
    el: '#app',
    data: {
      friends: res.friends,
      user: res.user
    }
  });
}