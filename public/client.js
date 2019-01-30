import * as Intro from './intro.js';
import * as Tweets from './tweets.js';
import * as Tweet from './tweet.js';
import * as Data from './data.js';
import * as Progress from './progress.js';
let store = window.localStorage;

Vue.autolinker = function(txt) {
  return Autolinker.link(txt, {
    mention: 'twitter',
    hashtag: 'twitter'
  });
}

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

function render(res) {
  console.log('Rendering ', JSON.parse(JSON.stringify(res)));
  
  const dataDefaults = {
    friend: { name: "Loading...", screen_name: "Loading..." },
    friends: res.friends,
    friendsOldest: res.friends.slice().reverse()
  }

  var app = new Vue({
    el: '#app',
    data: {
      sel: 0,
      friends: dataDefaults.friends,
      friendsOrdered: dataDefaults.friends,
      user: res.user,
      friend: dataDefaults.friend,
      introFinished: false,
      showBio: false,
      prefs: {
        order: store.getItem('prefsOrder') || 'oldest',
        saveProgressAsList: store.getItem('prefsSaveProgressAsList') ?
          JSON.parse(store.getItem('prefsSaveProgressAsList')) : true,
        showBio: store.getItem('prefsShowBio') ?
          JSON.parse(store.getItem('prefsShowBio')) : false
      },
      unfollowed: [],
      kept: [],
      loadedProgress: false,
      savedProgress: false
    },
    methods: {
      updatePrefs: function(e) {
        [this.prefs.order, this.prefs.saveProgressAsList, this.prefs.showBio] = e;
        switch (this.prefs.order) {
          case 'oldest':
            this.friendsOrdered = this.friends.slice().reverse();
            break;
          case 'random':
            // Hack to trigger updating/watching, otherwise Vue won't notice
            this.friendsOrdered = shuffle(this.friends).slice();
            break;
          case 'newest':
            this.friendsOrdered = this.friends;
            break;
        }
        this.showBio = this.prefs.showBio;
        store.setItem('prefsOrder', this.prefs.order);
        store.setItem('prefsSaveProgressAsList', this.prefs.saveProgressAsList);
        store.setItem('prefsShowBio', this.prefs.showBio);
      },
      next: function() {
        this.sel = Math.min(this.sel + 1, this.friends.length - 1);
        if (this.prefs.showBio == false) this.showBio = false;
        Progress.saveQuick(this.kept, store);
        this.saveProgressList();
      },
      prev: function() {
        this.sel = Math.max(this.sel - 1, 0);
        if (this.prefs.showBio == false) this.showBio = false;
      },
      getData: function(userId) {
        if (userId == null) return;
        console.log('getting data for ', userId);
        window.fetch('https://tokimeki-unfollow.glitch.me/data/user/' + userId)
          .then(res => res.json())
          .then(res => {
          console.log('got data for ' + res.user.screen_name + ', ' + res.user.id_str, JSON.parse(JSON.stringify(res)));
          this.friend = res.user;
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
        if (this.prefs.saveProgressAsList == false) return;
        Progress.saveList(this.kept, store);
      },
      loadProgressQuick: function() {
        this.kept = Progress.loadQuick(store) || this.kept;
        this.friends = this.friends.filter(id => !this.kept.includes(id));
        console.log('has david?', this.friends.includes(9716782));
        this.loadedProgress = (this.kept.length > 0);
      },
      loadProgressList: function() {
        if (this.prefs.saveProgressAsList == false) return;
        Progress.loadList(store)
          .then(res => {
            let ids = res.user_ids;
            if (ids && ids.length) {
              // Combine in case the quick load and twitter list are different
              this.kept = this.kept.concat(ids.filter((id, i) => this.kept.indexOf(id) < 0));
              this.friends = this.friends.filter(id => !this.kept.includes(id));
              console.log('has david?', this.friends.includes(9716782));
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
    },
    watch: {
      selFriendId: {
        handler: function() {
          this.friend = dataDefaults.friend
          this.getData(this.selFriendId);
        },
        immediate: true
      }
    },
    computed: {
      selFriendId() {
        console.log("selFriendId updated:", this.friends[this.sel]);
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