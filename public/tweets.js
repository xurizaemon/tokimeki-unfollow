'use strict';var _typeof='function'==typeof Symbol&&'symbol'==typeof Symbol.iterator?function(obj){return typeof obj}:function(obj){return obj&&'function'==typeof Symbol&&obj.constructor===Symbol&&obj!==Symbol.prototype?'symbol':typeof obj};/*global define*/var _html=require('linkifyjs/html'),_html2=_interopRequireDefault(_html);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj}}(function(){function a(b,c){b.innerHTML=(0,_html2.default)(b.innerHTML,c.value)}'object'==('undefined'==typeof exports?'undefined':_typeof(exports))?module.exports=a:'function'==typeof define&&define.amd?define([],function(){return a}):window.Vue&&window.Vue.directive('linkified',a)})();

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
    },
    formatTweetTime(timeString) {
      let d = new Date(timeString),
          month = d.getMonth,
          day = d.getDay(),
          date = d.getDate(),
          year = String(d.getFullYear()).slice(2,4)
      return `${month}/${day}/${year}`;
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
        <ol id="backup-tweets">
          <li v-for='t in tweets' class="backup-tweet">
            {{ t.text }}
            <br>
            <img v-if='t.entities && t.entities.media && t.entities.media[0]' v-bind:src='t.entities.media[0].media_url_https'>
            <br>
            <i>{{ formatTweetTime(t.created_at) }}</i>
          </li>
        </ol>
      </div>
    </div>
  `
});