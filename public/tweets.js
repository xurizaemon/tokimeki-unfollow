let wdgt = Vue.component('twttr-widget', {
  data: function() {
    return {
      tweets: []
    }
  },
  props: ['username', 'id', 'private'],
  methods: {
    getData(id) {
      window.fetch('https://tokimeki-unfollow.glitch.me/data/tweets/' + id)
        .catch(e => console.log('error getting tweets', e))
        .then(r => r.json())
        .then(r => this.tweets = r.tweets);
    },
    reloadTwttrWidget() {
      if (twttr) twttr.widgets.load();
    }
  },
  watch: {
    id() {
      this.getData(this.id);
    }
  },
  computed: {
    href: function() {
      return 'https://twitter.com/'+ this.username + '?ref_src=twsrc%5Etfw'
    },
    twttrScriptLoaded() {
      return twttr && twttr !== undefined;
    },
    shouldUseTwttrWidget() {
      return this.twttrScriptLoaded && this.private === false;
    }
  },
  mounted: function() {
    this.reloadTwttrWidget();
  },
  updated: function() {
    this.reloadTwttrWidget();
  },
  template: `
    <div :key='username' v-cloak>
      <div v-if="shouldUseTwttrWidget">
        <a class="twitter-timeline"
          data-width="400"
          data-height="100%"
          data-dnt="true"
          data-theme="light"
          data-chrome="nofooter noheader"
          v-bind:href="href">Loading tweets by {{ username }}...</a>
      </div>
      <div v-else>
        <ol>
          <li v-for='t in tweets'>
            {{ t.text }}
            <br>
            <img v-if='t.entities && t.entities.media && t.entities.media[0]' v-bind:src='t.entities.media[0].media_url_https'>
            <br>
            <i>{{ t.created_at }}</i>
          </li>
        </ol>
      </div>
    </div>
  `
});
      // data: function() {
      //   return {
      //     user: {screen_name:'Loading...'},
      //     tweets: [{text:'Loading tweets...'},{text:'...'},{text:'...'}]
      //   }
      // },
  // methods: {
  //   getData: function(userId) {
  //     Promise.all([
  //       window.fetch('https://tokimeki-unfollow.glitch.me/data/user/' + userId),
  //       window.fetch('https://tokimeki-unfollow.glitch.me/data/tweets/' + userId)
  //     ]).then(res => Promise.all(res.map(r => r.json())))
  //       .then(res => {
  //       console.log(res);
  //       this.user = res[0].user;
  //       this.tweets = res[1].tweets;
  //     });
  //   }
  // },
  // created: function() {
  //   this.getData(this.id);
  // },
  



