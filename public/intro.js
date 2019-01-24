let wdgt = Vue.component('intro', {
  data: function() {
    return {
      
    }
  },
  props: [
    'username',
    'followingcount'
  ],
  methods: {
    start: function(e) {
      
    }
  },
  computed: {
    href: function() {
      return ''
    }
  },
  template: ` 
    <div id='intro' v-cloak>
      <h1>
        Hello, @{{ username }}! Let's konmari those {{followingcount}} accounts you're following ~_~
      </h1>
      <p>
        If you hate looking at your feed and you think it's because you follow too many accounts,
        you're in the right place!
      </p>
      <p>
        If you're like me, you've followed a bajillion accounts over your years on Twitter dot com.
        Some of them date back to your first days on Twitter, when you were probably an entirely different human being.
        You have some socially-obliged follows sprinkled among some thought leaders you've outgrown,
        but you've never found the energy to go through and clean up your follows.
      </p>
      <p>
        Take a deep breath! Let's walk through our follows, one by one, and think about if each one still sparks joy, intrigue, inspiration,
        or is in any way still important to you. <b>If not, hit that Unfollow button!</b>
      </p>
      <h2>
        Options:
      </h2>
      <form>
        <div>
          <input type="checkbox" id="showBio" value="showBio">
          <label for="showBio"><b>Show account bios</b> (Recommended: off)
            I've followed a lot of accounts based on their profile, and not their actual content.</label>
        </div>
        <div>
          <input type="checkbox" id="saveList" value="saveList">
          <label for="saveList"><b>Save progress as a private Twitter list</b> so you can resume</label>
        </div>
      </form>
      <a href='#' v-on:click="$emit('intro-finished')">Start</a>
  </div>
  `
});