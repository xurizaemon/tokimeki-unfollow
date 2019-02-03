import * as Intro from './views/intro.js';
import * as Tweets from './views/tweets.js';
import * as Tweet from './views/tweet.js';
import * as Finish from './views/finish.js';
import * as AddToList from './views/addToList.js';
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
      store.setItem('current_session_count', JSON.stringify(0)); // Reset current session count
      render({
        user: res[0].data,
        friends: res[1].data.ids,
        lists: res[2].data.lists,
        current_session_count: 0
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
    lists: JSON.parse(store.getItem('lists')),
    current_session_count: JSON.parse(store.getItem('current_session_count'))
  });
}

function invalidateStore(store) {
  console.log('Validating store from',store.getItem('updated'));
  let updated = store.getItem('updated');
  if (updated === null || updated === 'undefined') { return true }
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
    lists: res.lists,
    current_session_count: res.current_session_count
  }

  var app = new Vue({
    el: '#app',
    data: {
      sel: 0,
      user: dataDefaults.user,
      start_count: dataDefaults.user.friends_count,
      friends: dataDefaults.friends,
      friendsFiltered: dataDefaults.friends,
      friend: dataDefaults.friend,
      lists: dataDefaults.lists,
      showBio: false,
      prefs: {
        order: store.getItem('prefsOrder') || 'oldest',
        saveProgressOnServer: store.getItem('prefsSaveProgressOnServer') ?
          JSON.parse(store.getItem('prefsSaveProgressOnServer')) : true,
        showBio: store.getItem('prefsShowBio') ?
          JSON.parse(store.getItem('prefsShowBio')) : false
      },
      unfollowed: [],
      kept: [],
      addedToList: [],
      lastAddedToList: '',
      loadedProgress: false,
      introFinished: false, // RESET
      finished: false, // RESET
      showAddToListMenu: false
    },
    methods: {
      showPrefs() {
        // Since we allow users to go back to options, we need to reset the filtered list
        // every time they press 'start' again
        this.filterFriends();
        this.sel = 0;
        
        this.loadedProgress = (this.kept.length > 0 || this.unfollowed.length > 0);
        this.introFinished = false;
      },
      updatePrefs: function(e) {
        [this.prefs.order, this.prefs.saveProgressOnServer, this.prefs.showBio] = e;
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
        store.setItem('prefsSaveProgressOnServer', this.prefs.saveProgressOnServer);
        store.setItem('prefsShowBio', this.prefs.showBio);
      },
      next: function() {
        if (this.sel == this.friends.length - 1) this.finished = true;
        this.sel = Math.min(this.sel + 1, this.friends.length - 1);
        if (this.prefs.showBio == false) this.showBio = false;
        this.saveProgressServer();
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
          this.current_session_count += 1;
        });
      },
      addToList(e) {
        let listId = e;
        console.log(e)
        Data.addToList(this.selFriendId, listId)
          .then(res => {
          console.log('added to list', res.data);
          this.addedToList.push(this.selFriendId);
          console.log('added to list', this.selFriendId);
          console.log(this.addedToList);
          this.lastAddedToList = res.data.name;
        });
      },
      createList(e) {
        let [name, isPrivate] = e;
        Data.createList(name, isPrivate)
          .then(res => {
          this.lists.unshift({
            name: res.data.name,
            id_str: res.data.id_str,
            member_count: res.data.member_count
          });
          store.setItem('lists', JSON.stringify(this.lists));
        });
      },
      keep: function() {
        console.log('keeping');
        this.kept.push(this.selFriendId);
      },
      unkeep: function() {
        this.kept.pop(); // this seems risky since we are not verifiying if it's there or not
        console.log('unkept', this.kept);
      },
      saveProgressServer: function() {
        Progress.saveQuick(this.kept, this.unfollowed, this.start_count, this.current_session_count, store);
        if (this.prefs.saveProgressOnServer == false) return;
        Progress.saveServer(this.kept, this.unfollowed, this.start_count, store);
      },
      filterFriends() {
        this.friendsFiltered = this.friendsFiltered.filter(id => {
          return !(this.kept.includes(id) || this.unfollowed.includes(id))
        });
      },
      loadProgressQuick: function() {
        let load = Progress.loadQuick(store);
        this.kept = load.kept || this.kept;
        this.unfollowed = load.unfollowed || this.unfollowed;
        this.filterFriends();
        this.loadedProgress = (this.kept.length > 0 || this.unfollowed.length > 0);
        if (load.start_count > this.start_count) {
          this.start_count = load.start_count || this.start_count;
        }
        this.current_session_count = load.current_session_count;
        if (this.friendsFiltered.length == 0) this.finished = true;
      },
      loadProgressServer: function() {
        if (this.prefs.saveProgressOnServer == false) return;
        Progress.loadServer(store)
          .then(res => {
            if (res.status == 200) {
              console.log('loaded', res);
              // Combine in case the quick load and twitter list are different
              this.kept = this.kept.concat(res.kept_ids.filter((id, i) => this.kept.indexOf(id) < 0));
              this.unfollowed = this.unfollowed.concat(res.unfollowed_ids.filter((id, i) => this.unfollowed.indexOf(id) < 0));
              this.filterFriends();
              this.loadedProgress = (this.kept.length > 0 || this.unfollowed.length > 0);
              this.start_count = res.start_count || this.start_count;
              if (this.friendsFiltered.length == 0) this.finished = true;
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
      },
      formatBio(text) {
        return '&ldquo;'+Vue.autolinker(text)+'&rdquo;';
      }
    },
    created: function() {
      this.loadProgressQuick();
      this.loadProgressServer();
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
      selFriendIsAddedToList() {
        return this.addedToList.includes(this.selFriendId);
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