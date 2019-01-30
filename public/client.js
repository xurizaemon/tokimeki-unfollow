import * as Intro from './views/intro.js';
import * as Tweets from './views/tweets.js';
import * as Tweet from './views/tweet.js';
import * as Data from './modules/data.js';
import * as Progress from './modules/progress.js';
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
    window.fetch('https://tokimeki-unfollow.glitch.me/data/friends'),
    window.fetch('https://tokimeki-unfollow.glitch.me/data/lists/ownerships')
  ]).then(res => Promise.all(res.map(r => r.json())))
    .then(res => {
    if (res[0].status == 200 &&
        res[1].status == 200 &&
        res[2].status == 200) {
      console.log('fetched new user data', res);
      store.setItem('updated', new Date().toString());
      store.setItem('user', JSON.stringify(res[0].data));
      store.setItem('friends', JSON.stringify(res[1].data.ids));
      store.setItem('lists', JSON.stringify(res[2].data.lists));
      render({
        user: res[0].data,
        friends: res[1].data.ids,
        lists: res[2].data.lists
      });
    } else {
      throw res;
    }
  }).catch(e => {
    console.log('error loading user data', e);
    alert(e);
  });
}

if (invalidateStore(store)) {
  console.log('No valid data in store, fetching from Twitter');
  getLoggedInUserData();
} else {
  console.log('Valid data in store');
  render({
    user: JSON.parse(store.getItem('user')),
    friends: JSON.parse(store.getItem('friends')),
    lists: JSON.parse(store.getItem('lists'))
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
    store.getItem('friends') === null ||
    store.getItem('lists') === null ||
    store.getItem('user') === 'undefined' ||
    store.getItem('friends') === 'undefined' ||
    store.getItem('lists') === 'undefined'
}

function render(res) {
  console.log('Rendering ', JSON.parse(JSON.stringify(res)));
  
  const dataDefaults = {
    friend: { name: "Loading...", screen_name: "Loading..." },
    friends: res.friends,
    user: res.user,
    lists: res.lists
  }

  var app = new Vue({
    el: '#app',
    data: {
      sel: 0,
      user: dataDefaults.user,
      friends: dataDefaults.friends,
      friendsFiltered: dataDefaults.friends,
      friend: dataDefaults.friend,
      lists: dataDefaults.lists,
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
      savedProgress: false,
      finished: false,
      showAddToListMenu: false,
      showCreateListMenu: false
    },
    methods: {
      updatePrefs: function(e) {
        [this.prefs.order, this.prefs.saveProgressAsList, this.prefs.showBio] = e;
        switch (this.prefs.order) {
          case 'oldest':
            this.friends = this.friendsFiltered.slice().reverse();
            break;
          case 'random':
            // Hack to trigger updating/watching, otherwise Vue won't notice
            this.friends = shuffle(this.friendsFiltered.slice()).slice();
            break;
          case 'newest':
            this.friends = this.friendsFiltered;
            break;
        }
        this.showBio = this.prefs.showBio;
        store.setItem('prefsOrder', this.prefs.order);
        store.setItem('prefsSaveProgressAsList', this.prefs.saveProgressAsList);
        store.setItem('prefsShowBio', this.prefs.showBio);
      },
      next: function() {
        if (this.sel == this.friends.length - 1) this.finished = true;
        this.sel = Math.min(this.sel + 1, this.friends.length - 1);
        if (this.prefs.showBio == false) this.showBio = false;
        this.saveProgressList();
      },
      prev: function() {
        this.sel = Math.max(this.sel - 1, 0);
        if (this.prefs.showBio == false) this.showBio = false;
      },
      getData: function(userId) {
        if (userId == null) return;
        console.log('fetching user ', userId);
        window.fetch('https://tokimeki-unfollow.glitch.me/data/user/' + userId)
          .then(res => res.json())
          .then(res => {
          if (res.status = 200) {
            console.log('got user ' + res.data.screen_name + ', ' + res.data.id_str, JSON.parse(JSON.stringify(res)));
            this.friend = res.data;
          } else {
            console.log('could not get user', res.error, res.errorCode);
            alert(res.error);
            this.friend = dataDefaults.friend;
          }
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
      filterKeptFriends: function() {
      },
      saveProgressList: function() {
        Progress.saveQuick(this.kept, this.unfollowed, store);
        if (this.prefs.saveProgressAsList == false) return;
        Progress.saveList(this.kept, this.unfollowed, store);
      },
      loadProgressQuick: function() {
        this.kept = Progress.loadQuick(store).kept || this.kept;
        this.unfollowed = Progress.loadQuick(store).unfollowed || this.unfollowed;
        this.friendsFiltered = this.friendsFiltered.filter(id => !this.kept.includes(id));
        this.loadedProgress = (this.kept.length > 0);
      },
      loadProgressList: function() {
        if (this.prefs.saveProgressAsList == false) return;
        Progress.loadList(store)
          .then(res => {
            if (res.user_ids) {
              // Combine in case the quick load and twitter list are different
              this.kept = this.kept.concat(res.user_ids.filter((id, i) => this.kept.indexOf(id) < 0));
              this.friendsFiltered = this.friendsFiltered.filter(id => !this.kept.includes(id));
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
      iframeURL() {
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