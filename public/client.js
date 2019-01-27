import * as Intro from './intro.js';
import * as Tweets from './tweets.js';
import * as Data from './data.js';
import * as Progress from './progress.js';
let store = window.localStorage;

function getLoggedInUserData() {
  console.log('get logged in user data')
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
}

if (invalidateStore(store)) {
  console.log('No valid data in store, fetching from Twitter');
  getLoggedInUserData();
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

function defaultAppData() {
  return 
}

function render(res) {
  console.log('Rendering ', res);
  Vue.use(AsyncComputed);

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
        saveProgressAsList: true
      },
      unfollowed: [],
      kept: [],
      loadedProgress: false,
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
        // TODO: cache data so when going back and forth (debug only problem) it doesnt trigger so many calls
        console.log('getting data for ', userId);
        if (userId == null) return;
        Promise.all([
          window.fetch('https://tokimeki-unfollow.glitch.me/data/user/' + userId),
          window.fetch('https://tokimeki-unfollow.glitch.me/data/tweets/' + userId)
        ]).then(res => Promise.all(res.map(r => r.json())))
          .then(res => {
          console.log('got data for ' + res[0].user.screen_name + ', ' + res[0].user.id_str, res);
          this.friend = res[0].user;
          this.tweets = res[1].tweets;
        });
      },
      unfollow: function() {
        Data.unfollow(this.selFriendId, (userId) => {
          this.unfollowed.push(userId);
          console.log('unfollowed', userId);
          console.log(this.unfollowed);
        });
      },
      addToList: Data.addToList,
      keep: function() {
        console.log('keeping');
        this.kept.push(this.selFriendId);
        this.saveProgress(this.kept);
      },
      unkeep: function() {
      },
      saveProgress: function(ids) {
        console.log('saving', ids);
        // Progress.save(ids, store)
        Progress.save(ids, store, this.prefs.saveProgressAsList)
          .then(function(res) {
            console.log('response', res);
            if (res.status == 200) {
              console.log('save success');
            }
          });
      },
      loadProgress: function() {
        return Progress.load(store, this.prefs.saveProgressAsList)
          .then(res => {
            if (res && res.user_ids && typeof res.user_ids == 'object') { 
              this.kept = res.user_ids;
              this.friends = this.friends.filter(id => !this.kept.includes(id));
              console.log('loaded', this.kept);
              console.log('filtered', this.friends.length - this.kept.length);
              this.loadedProgress = (this.kept.length > 0);
            }
            return new Promise((resolve, reject) => {
              resolve();
            });
        });
      },
      follow: function() {
        Data.follow(this.selFriendId, (userId) => {
          this.unfollowed.pop(); // this seems risky since we are not verifiying if it's there or not
          console.log('followed', userId);
          console.log(this.unfollowed);
        });
      },
      resetApp: function() {
        getLoggedInUserData();
        // proper reset should not call render() again
        // should only change this.$data
      }
    },
    created: function() {
      this.loadProgress();
    },
    watch: {
      sel: function() {
        // this.selFriendId = this.friends[this.sel];
        // this.getData(this.selFriendId);
      },
      selFriendId: {
        handler: function(newId, oldId) {
          if (newId != oldId) this.getData(this.selFriendId);
        // this.selFriendIsKept = this.kept.includes(this.selFriendId);
        },
        immediate: true
      },
      kept() {
        // this.selFriendIsKept = this.kept.includes(this.selFriendId);
      },
      friends() { 
        // console.log(this.friends);
        // this.selFriendId = this.friends[this.sel];
      }
    },
    computed: {
      selFriendId() {
        console.log(this.friends[this.sel]);
        return this.friends[this.sel];
      },
      selFriendIsKept() {
        return this.kept.includes(this.selFriendId);
      },
      selFriendUsername: function(e) {
        return this.friend.screen_name;
      },
      selFriendIsUnfollowed: function(e) {
        return this.unfollowed.includes(this.selFriendId);
      },
      iframeURL: function(e) {
        return 'https://twitter.com/intent/user?user_id='+this.friends[this.sel];
      }
    }
  });
}