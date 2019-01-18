import('./scripts/vue.js');
let store = window.localStorage;

if (store.getItem('res') === null) {
  console.log('No friends in store, fetching from Twitter');
  window.fetch('https://tokimeki-unfollow.glitch.me/data/friends')
  .then((res) => res.json())
  .then((res) => {
    console.log(res);
    store.setItem('res',JSON.stringify(res));
    render(res);
  });
} else {
  console.log('Fetched from store ', store.getItem('res'));
  render(JSON.parse(store.getItem('res')));
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