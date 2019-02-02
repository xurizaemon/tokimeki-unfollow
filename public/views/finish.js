import { getKeptPics } from '../modules/data.js';
let finish = Vue.component('finish', {
  data: function() {
    return {
      kept_pics: [],
      kept_pics_styles: []
    }
  },
  props: [
    'startcount',
    'keptcount',
    'listcount'
  ],
  computed: {
    tweetLink() {
      let text = "✨I just konmari'd my Twitter!✨\n\n" +
        `Started with ${this.startcount} follows and unfollowed ${this.startcount-this.keptcount}` +
        " using Tokimeki Unfollow\nhttps://tokimeki-unfollow.glitch.me";
      return 'https://twitter.com/intent/tweet?text=' +
        encodeURI(text);
    }
  },
  methods: {
    fetchPics: function() {
      getKeptPics()
        .then(res => {
        console.log(res)
        this.kept_pics = res.data.pics;
      });
    }
  },
  watch: {
    kept_pics() {
      this.kept_pics_styles = [];
      for (let i = 0; i < this.kept_pics.length; i++) {
        let delay = Math.random() * 10;
        this.kept_pics_styles.push({
          left: `${(Math.random() * 110) - 10}%`,
          'animation-delay': `${delay}s, ${delay - Math.random() * 3}s`,
          'z-index': `${Math.random() > .5 ? 1 : -1}`
        });
      }
    }
  },
  created() {
    this.fetchPics();
  },
  template: ` 
    <div class="flex-parent">
      <div v-for="pic, i in kept_pics"
        class="snowflake card circle" :style="kept_pics_styles[i]">
        <img :src="pic">
      </div>
      <div class="flex-top flex flex-col just-cent">
        <div id="intro" class="card" style="min-width: 320px">
          <h1>
<center>
            Tokimeki Complete!
</center>
          </h1>
<br>
          <h3 class="notbold">
          <p class="gray">
            Results
            </p>
<p>
<strong class="flt-r">{{ startcount }}</strong>
Starting follows
</p>
          <p>
            Unfollowed
            <strong class="flt-r logored">-{{ startcount - keptcount }}</strong>
          </p>
          <span v-if="listcount > 0">
            <p>
              <strong class="flt-r">{{ listcount }}</strong>
              Added to list
            </p>
          </span>
          <hr>
          <br>
          <p>
            <strong class="flt-r keepblue">{{ keptcount }}</strong>
            Now Following
          </p>
            </h3>
        </div>
      </div>
      <div>
        <div id="ctrl">
          <div id="avvy"></div>
          <div id="info">

          <p>
            Wow, you finished! I'm super proud of you, and I hope you enjoy your timeline more now.
            If you ever feel like it's getting out of control again, you know where to go!
          </p>
          <p>
            If this tool sparked joy, please share it with your friends!
            If you have the means, please consider donating to
            <a href="http://susiesseniordogs.com/donate/" target="_blank" class="keepblue">
              Susie's Senior Dogs</a>.
          </p>
          </div>
          <div id="btns">
            <a :href='tweetLink' target="_blank" class="button dib">Tweet</a>
          </div>
        </div>
      </div>
  </div>
  `
});