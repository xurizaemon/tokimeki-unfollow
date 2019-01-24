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
        Hello, {{ username }}! Let's KonMari that Twitter feed~
      </h1>
      <p>
        A couple of things: this is a slightly opinionated unfollowing tool.
        I've carried some of my own biases about what "sparks joy" for me, and this may not be for everyone.
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