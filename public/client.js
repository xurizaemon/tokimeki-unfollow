import * as Intro from './intro.js';
import * as Tweets from './tweets.js';
import * as Data from './data.js';
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
    store.setItem('user', JSON.stringify(res[0].user));
    store.setItem('friends', JSON.stringify(res[1].friends));
    render({
      user: res[0].user,
      friends: res[1].friends
    });
  });
} else {
  console.log('Valid data in store');
  render({
    user: JSON.parse(store.getItem('user')),
    friends: JSON.parse(store.getItem('friends'))
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
      sel: 0,
      friends: res.friends,
      user: res.user,
      friend: { screen_name: "Loading..." },
      tweets: [],
      introFinished: false,
      showBio: false,
      prefs: {
        showBio: false,
        order: 'newest',
        
      }
    },
    methods: {
      next: function(e) {
        this.sel = Math.min(this.sel + 1, this.friends.length - 1);
        this.showBio = false;
      },
      prev: function(e) {
        this.sel = Math.max(this.sel - 1, 0);
        this.showBio = false;
      },
      getData: function(userId) {
        Promise.all([
          window.fetch('https://tokimeki-unfollow.glitch.me/data/user/' + userId),
          window.fetch('https://tokimeki-unfollow.glitch.me/data/tweets/' + userId)
        ]).then(res => Promise.all(res.map(r => r.json())))
          .then(res => {
          console.log(res);
          this.friend = res[0].user;
          this.tweets = res[1].tweets;
        });
      },
      unfollow: function() {
        Data.unfollow(this.selFriendId);
      },
      addToList: Data.addToList,
      keep: Data.keep
    },
    created: function() {
      this.getData(this.selFriendId);
    },
    watch: {
      sel: function(newId) {
        this.getData(this.selFriendId);
      }
    },
    computed: {
      selFriendId: function(e) {
        return this.friends[this.sel];
      },
      selFriendUsername: function(e) {
        return this.friend.screen_name;
      },
      iframeURL: function(e) {
        return 'https://twitter.com/intent/user?user_id='+this.friends[this.sel];
      }
    }
  });
}