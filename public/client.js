let store = window.localStorage;

if (invalidateRes(store.getItem('res'))) {
  console.log('No valid data in store, fetching from Twitter');
  Promise.all([
    window.fetch('https://tokimeki-unfollow.glitch.me/data/user'),
    window.fetch('https://tokimeki-unfollow.glitch.me/data/friends')
  ]).then(res => Promise.all(res.map(r => r.json())))
    .then(res => {
    console.log(res);
    store.setItem('user',res[0].user);
    store.setItem('friends',res[1].friends);
    render({
      user: res[0].user,
      friends: res[1].friends
    });
  });
} else {
  console.log('Fetched from store ', store.getItem('res'));
  render(JSON.parse(store.getItem('res')));
}

function invalidateRes(res) {
  console.log('Validating store ', res);
  return res === null ||
    res.friends === undefined ||
    res.user === undefined;
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