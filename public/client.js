window.fetch('https://tokimeki-unfollow.glitch.me/data/friends')
  .then((res) => res.json())
  .then((res) => {
    window.alert('hello')
    var app = new Vue({
      el: '#app',
      data: {
        friends: ['1','2']
      }
    });
  });

