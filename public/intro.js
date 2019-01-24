let wdgt = Vue.component('intro', {
  data: function() {
    return {
      
    }
  },
  props: [
    'username',
    'following-count'
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
        Hello, @{{ username }}! Let's KonMari those {{following-count}} accounts you're following ~_~
      </h1>
      <p>
        If you're not happy with the mix of content you're seeing in your feed
        and you think it's because of the ginormous list of accounts you follow,
        you're in the right place!
      </p>
      <p>
        If you're like me, you've followed a bajillion accounts over your years on Twitter dot com.
        Some of them date back to your first days on Twitter, when you were probably an entirely different human being.
        You have some socially-obliged follows sprinkled among some thought leaders you've outgrown.
      </p>
      <p>
        Let's walk through our follows, one by one
      </p>
      <h2>
        Options:
      </h2>
      <form>
        <div>
          <input type="checkbox" id="showBio" value="showBio">
          <label for="showBio">Show account bios</label>
        </div>
        <div>
          <input type="checkbox" id="saveList" value="saveList">
          <label for="saveList">Save KonMari progress as a private Twitter ilst</label>
        </div>
      </form>
      <a href='#' v-on:click="$emit('intro-finished')">Start</a>
  </div>
  `
});