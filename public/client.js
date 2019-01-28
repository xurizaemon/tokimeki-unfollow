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
    return true;
  }
  return store.getItem('user') === null ||
    store.getItem('friends') === null
}

function defaultAppData() {
  return 
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
        order: 'oldest',
        saveProgressAsList: true
      },
      unfollowed: [],
      kept: [],
      loadedProgress: false,
      savedProgress: false
    },
    methods: {
      next: function(e) {
        this.sel = Math.min(this.sel + 1, this.friends.length - 1);
        if (this.prefs.showBio == false) this.showBio = false;
        Progress.saveQuick(this.kept, store);
        this.saveProgressList();
      },
      prev: function(e) {
        this.sel = Math.max(this.sel - 1, 0);
        if (this.prefs.showBio == false) this.showBio = false;
      },
      getData: function(userId) {
        if (userId == null) return;
        console.log('getting data for ', userId);
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
      },
      unkeep: function() {
        this.kept.pop(); // this seems risky since we are not verifiying if it's there or not
        console.log('unkept', this.kept);
      },
      saveProgressList: function() {
        Progress.saveList(this.kept);
      },
      loadProgressQuick: function() {
        this.kept = Progress.loadQuick(store);
        this.friends = this.friends.filter(id => !this.kept.includes(id));
        this.loadedProgress = (this.kept.length > 0);
      },
      loadProgressList: function() {
        Progress.loadList()
          .then(ids => {
            if (ids && ids.Constructor === Array) { 
              this.kept = ids;
              this.friends = this.friends.filter(id => !this.kept.includes(id));
              this.loadedProgress = (this.kept.length > 0);
            }
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
      this.loadProgressQuick();
      this.loadProgressList();
      switch (this.prefs.order) {
        case 'random':
          this.friends = shuffle(this.friends);
          break;
        case 'oldest':
          this.friends = this.friends.reverse();
          break;
      }
    },
    watch: {
      selFriendId: {
        handler: function() {
          this.getData(this.selFriendId);
        },
        immediate: true
      }
    },
    computed: {
      selFriendId() {
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
      loadingSelFriend() {
        return this.sel > 0 && (this.selFriendId != this.friend.id_str);
      },
      iframeURL: function(e) {
        return 'https://twitter.com/intent/user?user_id='+this.friends[this.sel];
      }
    }
  });
}

/**
 * Randomly shuffle an array
 * https://stackoverflow.com/a/2450976/1293256
 * @param  {Array} array The array to shuffle
 * @return {String}      The first item in the shuffled array
 */
function shuffle(array) {

	var currentIndex = array.length;
	var temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;

};