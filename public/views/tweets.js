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
        .then(res => res.json())
        .then(res => {
          if (res.status == 200) {
            this.tweets = res.data;
          } else {
            this.tweets = [{
              text: `Unable to load tweets. Error ${res.errorCode}: ${res.error} Try again.`
            }];
          }
        });
    },
    reloadTwttrWidget() {
      if (twttr) twttr.widgets.load();
    },
    tweetOrRT(tweet) {
      if (tweet.retweeted_status) tweet.retweeted_status.retweeted_by = tweet.user.name;
      return tweet.retweeted_status || tweet;
    }
  },
  watch: {
    id() {
      this.tweets = [];
      this.getData(this.id);
    }
  },
  created: function() {
    this.getData(this.id);
    twttr.events.bind(
      'rendered',
      function (event) {
        console.log("Created widget", event.target.id);
        console.log(event.target);
        let iframe = event.target;
        var iframeWin = iframe.contentWindow || iframe.contentDocument.parentWindow;
        if (iframeWin.document.body) {
          iframe.height = iframeWin.document.documentElement.scrollHeight || iframeWin.document.body.scrollHeight;
        }
        console.log(iframe.height)
        console.log(iframeWin)
        console.log(iframeWin.document.documentElement.scrollHeight)
      }
    );
    
      twttr.events.bind(
        'loaded',
        function (event) {
          event.widgets.forEach(function (widget) {
            console.log("Created widget", widget.id);
            console.log(widget.height)    
            console.log(widget)
          });
        }
      );
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
      <div v-if="shouldUseTwttrWidget" id="iframe-container">
        <a class="twitter-timeline"
          data-width="400"
          data-height="100%"
          data-dnt="true"
          data-theme="light"
          data-chrome="nofooter noheader"
          v-bind:href="href">Loading tweets by {{ username }}...</a>
      </div>
      <div v-else>
        <ol id="backup-tweets">
          <div v-if="tweets.length == 0">Loading tweets by @{{ username }}...</div>
          <li v-for='t in tweets' :key="t.id_str">
            <tweet v-bind:tweet="tweetOrRT(t)">
            </tweet>
          </li>
        </ol>
      </div>
    </div>
  `
});