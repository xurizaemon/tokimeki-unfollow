let wdgt = Vue.component('twttr-widget', {
  data: function() {
    return {
      tweets: []
    }
  },
  props: ['username', 'id', 'private'],
  methods: {
    fetchTweets(id) {
      console.log('fetching tweets');
      window.fetch('https://tokimeki-unfollow.glitch.me/data/tweets/' + id)
        .catch(e => console.log('error getting tweets', e))
        .then(res => res.json())
        .then(res => {
        console.log('got tweets', res.data);
          if (res.status == 200) {
            this.tweets = res.data;
          } else {
            this.tweets = [{
              text: `Unable to load tweets. Error ${res.errorCode}: ${res.error} Try again.`
            }];
          }
        });
    },
    createTwitterWidget() {
      twttr.widgets.createTimeline({
        sourceType: 'profile',
        screenName: this.username
      },
      document.getElementById('iframe-container'),
      {
        width: '400',
        height: '100%',
        chrome: 'noheader noscrollbar nofooter noborders'
      }).then(function (el) {
        console.log('Embedded a timeline.')
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
  mounted: function() {
    // this.reloadTwttrWidget();
    // this.createTwitterWidget();
  },
  updated: function() {
    // this.reloadTwttrWidget();
    if (!this.private) this.createTwitterWidget();
  },
  created: function() {
    // this.createTwitterWidget();
    console.log(this.private)
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
      return this.twttrScriptLoaded && this.private != true;
    }
  },
  template: `
    <div :key='username' v-cloak>
      <div v-if="shouldUseTwttrWidget" id="iframe-container">
        <!--<a class="twitter-timeline"
          data-width="400"
          data-height="100%"
          data-dnt="true"
          data-theme="light"
          data-chrome="nofooter noheader"
          v-bind:href="href">Loading tweets by {{ username }}...</a>-->
      </div>
      <div v-else>
        <ol id="backup-tweets">
          <div class="backup-tweets-banner">Private user, using backup rendering</div>
          <div v-if="tweets.length == 0">
            <p>Loading tweets by @{{ username }}...</p>
            Not loading? <a href="#" :click="fetchTweets(id)">Try again</a></div>
          <li v-for='t in tweets' :key="t.id_str">
            <tweet v-bind:tweet="tweetOrRT(t)">
            </tweet>
          </li>
        </ol>
      </div>
    </div>
  `
});