let wdgt = Vue.component('intro', {
  data: function() {
    return {
      kept_pics: []
    }
  },
  props: [
    'username',
    'followingcount',
    'loadedprogress',
    'initialorder',
    'initialsaveprogressaslist',
    'initialshowbio'
  ],
  methods: {
    fetchPics: function(e) {
      Data.getKeptPics()
        .then(res => {
        this.kept_pics = res.data.pics;
      });
    }
  },
  watch: {
    loadedprogress() {
      this.showIntroText = !this.loadedprogress;
    }
  },
  computed: {
    href: function() {
      return ''
    }
  },
  template: ` 
    <div class="flex-parent">
      <div class="flex-top flex flex-col just-cent">
        <div id="intro" class="card">
          <h1>
            Tokimeki Complete!
          </h1>
          <h3>


          <p>
            You started with <strong>{{ start_count }}</strong> follows...
          </p>
          <br>
          <p class="gray">
            Results
            </p>
          <p>
            Unfollowed
            <strong class="flt-r">{{ start_count - kept.length }}</strong>
          </p>
          <span v-if="addedToList.length > 0">
            <p>
              <strong class="flt-r">{{ addedToList.length }}</strong>
              Added to list
            </p>
          </span>
          <hr>
          <br>
          <p>
            <strong class="flt-r">{{ kept.length }}</strong>
            Follows Today
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