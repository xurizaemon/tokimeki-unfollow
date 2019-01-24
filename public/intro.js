let wdgt = Vue.component('intro', {
  data: function() {
    return {
      
    }
  },
  props: ['idk'],
  computed: {
    href: function() {
      return ''
    }
  },
  template: ` 
    <div id='intro' v-cloak>
      <a class="twitter-timeline"
        data-width="400"
        data-height="100vh"
        data-dnt="true"
        data-theme="light"
        data-chrome="nofooter noheader"
        v-bind:href="href">Tweets by {{ username }}</a>
    </div>
  `
});