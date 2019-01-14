window.fetch('/data/friends')
  .then((res) => {
});

var app = new Vue({
  el: '#app',
  data: {
    friends: friends
  }
});