let wdgt = Vue.component('twttr-widget', {
  props: ['username'],
  computed: {
    href: function() {
      return 'https://twitter.com/'+ this.username + '?ref_src=twsrc%5Etfw'
    }
  },
  mounted: function() {
    twttr.widgets.load();
  },
  updated: function() {
    twttr.widgets.load();
  },
  template: ` 
    <div id='twttr-widget' :key='username' v-cloak>
      <a class="twitter-timeline"
        data-width="400"
        data-height="100%"
        data-dnt="true"
        data-theme="light"
        data-chrome="nofooter noheader"
        v-bind:href="href">Loading tweets by {{ username }}...</a>
    </div>
  `
});
      // data: function() {
      //   return {
      //     user: {screen_name:'Loading...'},
      //     tweets: [{text:'Loading tweets...'},{text:'...'},{text:'...'}]
      //   }
      // },
  // methods: {
  //   getData: function(userId) {
  //     Promise.all([
  //       window.fetch('https://tokimeki-unfollow.glitch.me/data/user/' + userId),
  //       window.fetch('https://tokimeki-unfollow.glitch.me/data/tweets/' + userId)
  //     ]).then(res => Promise.all(res.map(r => r.json())))
  //       .then(res => {
  //       console.log(res);
  //       this.user = res[0].user;
  //       this.tweets = res[1].tweets;
  //     });
  //   }
  // },
  // created: function() {
  //   this.getData(this.id);
  // },
  // watch: {
  //   id: function(newValue) {
  //     console.log('id changed', newValue);
  //     this.getData(newValue);
  //   }
  // },


// <ol>
//         <li v-for='t in tweets'>
//           {{ t.text }}
//           <br>
//           <img v-if='t.entities && t.entities.media && t.entities.media[0]' v-bind:src='t.entities.media[0].media_url_https'>
//           <br>
//           <i>{{ t.created_at }}</i>
//         </li>
//       </ol>

