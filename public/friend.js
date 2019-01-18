let friendComp = Vue.component('friend-card', {
  data: function() {
    return {
      user: {screen_name:'test'},
      tweets: [{text:'1'},{text:'2'},{text:'3'}]
    }
  },
  props: ['id'],
  methods: {
    getData: function(userId) {
      Promise.all([
        window.fetch('https://tokimeki-unfollow.glitch.me/data/user/' + userId),
        window.fetch('https://tokimeki-unfollow.glitch.me/data/tweets/' + userId)
      ]).then(res => Promise.all(res.map(r => r.json())))
        .then(res => {
        console.log(res);
        this.user = res[0].user;
        this.tweets = res[1].tweets;
      });
    }
  },
  created: function() {
    console.log('component hello', this.id);
    this.getData(this.id);
  },
  watch: {
    id: function(newValue) {
      console.log('id changed', newValue);
      this.getData(newValue);
    }
  },
  computed: {
    href: function() {
      return 'https://twitter.com/'+ this.user.screen_name + '?ref_src=twsrc%5Etfw'
    }
  },
  template: `
    <a class="twitter-timeline" data-width="400" data-height="400" data-dnt="true" data-theme="light" v-bind:href="href">Tweets by ire_alva</a> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
    <div id='friend' v-cloak>
      <h2>
        {{ user.screen_name }}
      </h2>
      <ol>
        <li v-for='t in tweets'>
          {{ t.text }}
          <br>
          <i>{{ t.created_at }}</i>
        </li>
      </ol>

    </div>
  `
});