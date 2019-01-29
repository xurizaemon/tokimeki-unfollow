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
        .then(r => {
          if (r.tweets) {
            this.tweets = r.tweets
          } else {
            this.tweets = [{text: "Unable to load tweets. Try again."}]
          }
        });
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
      <div v-else id="twttr-widget-backup">
        <ol>
          <li v-for='t in tweets' class="tweet">
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