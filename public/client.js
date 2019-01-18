let store = window.localStorage;

if (invalidateRes(store.getItem('res'))) {
  console.log('No valid data in store, fetching from Twitter');
  window.fetch('https://tokimeki-unfollow.glitch.me/data/friends')
  .then((res) => res.json())
  .then((res) => {
    console.log(res);
    store.setItem('res',JSON.stringify(res));
    store.setItem('friends',res.friends);
    store.setItem('user',res.user);
    render(res);
  });
} else {
  console.log('Fetched from store ', store.getItem('res'));
  render(JSON.parse(store.getItem('res')));
}

function invalidateRes(res) {
  return res === null ||
    res.friends === undefined ||
    res.user === undefined;
}

function render(res) {
  console.log('Rendering ', res);
  var app = new Vue({
    el: '#app',
    data: {
      friends: res.friends
    }
  });
}