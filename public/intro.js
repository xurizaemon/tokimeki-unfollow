let wdgt = Vue.component('intro', {
  data: function() {
    return {
      order: 'oldest',
      saveProgressAsList: true,
      showBio: false
    }
  },
  props: [
    'username',
    'followingcount',
    'loadedprogress'
  ],
  methods: {
    start: function(e) {
      this.$emit('intro-finished', [this.order, this.saveProgressAsList, this.showBio]);
    }
  },
  computed: {
    href: function() {
      return ''
    }
  },
  template: ` 
    <div id='intro' v-cloak>
      <div id="avvy-intro" class="fixed"></div>
      <h1>
        <span v-if='loadedprogress'>Hello again,</span>
        <span v-else>Hello,</span>
        @{{ username }}! Let's konmari those {{followingcount}} accounts you're following ~_~
      </h1>
      <p>
        Do you think your feed sucks because you follow too many accounts?
        You're in the right place!
      </p>
      <p>
        If you're like me, you've followed a bajillion accounts over your years on Twitter dot com.
        Some of them date back to your first days as an egg — when you were probably an entirely different human being.
        You have some socially-obliged follow-backs sprinkled among some thought leaders you've outgrown,
        but you've never found the energy to go through and clean up your follows.
      </p>
      <p>
        Take a deep breath! Let's walk through our follows, one by one, and think about if each one still sparks joy, intrigue, inspiration,
        or is in any way still important to you. <b>If not, hit that Unfollow button!</b>
      </p>
      <h3>
        Options
      </h3>
      <form>
        <p>
          <input type="checkbox" id="showBio" value="showBio" v-model="showBio">
          <label for="showBio"><b>Show account bio's</b> (Recommended: off)<br>
            I've followed a lot of accounts based on their profile, and not their actual content.
            It might help to hide their bio's so you can evaluate based on tweets only.</label>
        </p>
        <p>
          <input type="checkbox" id="saveList" value="saveList" v-model="saveProgressAsList">
          <label for="saveList"><b>Save progress as a private Twitter list</b> (Recommended: on)<br>
            Turn this on so you can resume this process from any device.
            If this is disabled, I'll save your progress to this web browser's local storage.
            It's going to be hard to do this all in one go, so don't feel bad if you need to take a break!</label>
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
      <a href='#' class='button block' v-on:click="start">Start</a>
  </div>
  `
});