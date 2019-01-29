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
    <li class="backup-tweet">
      <div v-if="tweet.retweeted_by">{{ tweet.retweeted_by }} Retweeted</div>
      <img v-bind:src="tweet.user.profile_image_url_https" class="backup-tweet-avatar">
      <span>
        <strong>{{ tweet.user.name }}</strong>
        <span class="gray">
          @{{ tweet.user.screen_name }} ·
          <vue2-timeago :datetime="new Date(tweet.created_at)"></vue2-timeago>
        </span>
      </span>
      <p v-html="formatTweetText(tweet.text)"></p>
      <img
        v-if='tweet.entities && tweet.entities.media && tweet.entities.media[0]'
        v-bind:src='tweet.entities.media[0].media_url_https'
        class="w100">
    </li>
  `
});