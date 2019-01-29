let tweetComponent = Vue.component('tweet', {
  data: function() {
    return {
    }
  },
  props: ['tweet'],
  methods: {
    formatTweetText(text) {
      return Vue.autolinker(text);
    }
  },
  template:`
    <li>
      <div v-if="tweet.retweeted_by" class="retweet gray w100">
        &#x1f501;&#xFE0E; Retweeted
      </div>
      <div class="backup-tweet">
        <img v-bind:src="tweet.user.profile_image_url_https" class="backup-tweet-avatar">
        <span>
          <strong>{{ tweet.user.name }}</strong>
          <span class="gray">
            @{{ tweet.user.screen_name }} ·
            <vue2-timeago :datetime="new Date(tweet.created_at)"></vue2-timeago>
          </span>
        </span>
        <br>
        <span v-html="formatTweetText(tweet.text)"></span>
        <img
          v-if='tweet.entities && tweet.entities.media && tweet.entities.media[0]'
          v-bind:src='tweet.entities.media[0].media_url_https'
          class="w100">
      </div>
    </li>
  `
});