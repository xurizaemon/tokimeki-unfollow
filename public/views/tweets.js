let wdgt = Vue.component('twttr-widget', {
  data: function() {
    return {
      tweets: []
    }
  },
  props: ['username', 'id', 'private'],
  methods: {
    fetchTweets(id) {
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
      if (this.private) this.fetchTweets(this.id);
    }
  },
  created: function() {
    if (this.private) this.fetchTweets(this.id);

    // A Huge Hack to "support" iframes for iOS devices
    // On widget load, set iframe height manually to timeline height
    // To support [Load More] button, adjust height on every touch/click event
    // Using this on desktop as well to minimize areas to debug
    let updateIframeHeight = (iframe) => {
      let timeline = iframe.contentDocument.documentElement.getElementsByClassName("timeline-TweetList")[0];
      iframe.style.height = timeline.offsetHeight + 64; // Load button height
      let viewport = iframe.contentDocument.documentElement.getElementsByClassName("timeline-Viewport")[0];
      viewport.style.overflow = "hidden"; // Hide scrollbar inside iframe
    }

    // There are two Twitter widget events: 'loaded' and 'rendered'.
    // Loaded happens later, presumably after timeline loads
    twttr.events.bind(
      'loaded',
      function (event) {
        event.widgets.forEach(function (widget) {
          updateIframeHeight(widget);
          
          let delayedUpdateIframeHeight = () => {
            setTimeout(() => updateIframeHeight(widget), 250); // Account for fast loads
            setTimeout(() => updateIframeHeight(widget), 1000);
            setTimeout(() => updateIframeHeight(widget), 2000); // For good measure
          }
          widget.contentDocument.addEventListener('touchend', delayedUpdateIframeHeight);
          widget.contentDocument.addEventListener('click', delayedUpdateIframeHeight);
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