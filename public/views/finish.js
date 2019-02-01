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
          left: `${Math.random() * 100}%`,
          'animation-delay': `${delay}s, ${delay - Math.random() * 3}s`
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
        <div id="intro" class="card">
          <h1>
            Tokimeki Complete!
          </h1>
          <h3>
          <p>
            You started with <strong>{{ startcount }}</strong> follows...
          </p>
          <br>
          <p class="gray">
            Results
            </p>
          <p>
            Unfollowed
            <strong class="flt-r">{{ startcount - keptcount }}</strong>
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
            <strong class="flt-r">{{ keptcount }}</strong>
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
          </div>
          <div id="btns">
            <button class="button dib">Tweet</button>
          </div>
        </div>
      </div>
  </div>
  `
});