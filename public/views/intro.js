let wdgt = Vue.component('intro', {
  data: function() {
    return {
      order: this.initialorder,
      saveProgressOnServer: this.initialsaveprogressonserver,
      showBio: this.initialshowbio,
      showIntroText: false
    }
  },
  props: [
    'username',
    'followingcount',
    'leftcount',
    'loadedprogress',
    'initialorder',
    'initialsaveprogressonserver',
    'initialshowbio'
  ],
  methods: {
    start: function(e) {
      window.scrollTo(0,0);
      this.$emit('intro-finished', [this.order, this.saveProgressOnServer, this.showBio]);
    }
  },
  watch: {
    loadedprogress() {
      this.showIntroText = !this.loadedprogress;
    }
  },
  template: ` 
    <div id='intro' v-cloak>
      <div id="avvy-intro" class="fixed"></div>
      <h1>
        <span v-if='loadedprogress'>Hello again,</span>
        <span v-else>Hello,</span>
        @{{ username }}! Let's konmari those {{followingcount}} accounts you're following ~_~
        <span v-if='loadedprogress'>{{leftcount}} to go!</span>
      </h1>
      <p>
        It's hard to do this all in one go, so don't feel bad if you need to take a break.
        I'll save your progress as you go so you can pick it up again another time.
      </p>
      <h3>
        Options
      </h3>
      <form>
        <p>
          <input type="checkbox" id="showBio" value="showBio" v-model="showBio">
          <label for="showBio"><b>Show account bio's</b> (Recommended: off)<br>
            I've followed a lot of accounts based on their profile or who they are, but not their actual tweets.
            Hide their bio's so you can evaluate based on content only.</label>
        </p>
        <p>
          <input type="checkbox" id="saveServer" value="saveServer" v-model="saveProgressOnServer">
          <label for="saveServer"><b>Save progress on the server</b> (Recommended: on)<br>
            Turn this on so you can resume this process from any device.
            If this is off, I'll still save your progress to this browser's local storage.</label>
        </p>
        <p>
          <b>Select an order to use:</b> (Recommended: Oldest first)
          <br>
          <input type="radio" name="order" id="oldest" value="oldest" v-model="order">
          <label for="oldest">Oldest first, chronological order</label><br>
          <input type="radio" name="order" id="random" value="random" v-model="order">
          <label for="random">Random order</label><br>
          <input type="radio" name="order" id="newest" value="newest" v-model="order">
          <label for="newest">Newest first, reverse chronological order</label><br>
        </p>
      </form>
      <br>
      <button class='button w100 big-screen' v-on:click="start">Start</button>
      <button class='button dib small-screen' v-on:click="start">Start</button>
      <br><br>

      <div class='gray small-screen-pad-r'>
        Made by <a href='https://tarng.com' class='gray'> Julius Tarng</a>.
        Follow <a href='https://twitter.com/tarngerine' class='gray'> @tarngerine</a> for more tools, games, and art!
      </div>
  </div>
  `
});