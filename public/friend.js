function getData(userId) {
  Promise.all([
    window.fetch('https://tokimeki-unfollow.glitch.me/data/user/:' + userId),
    window.fetch('https://tokimeki-unfollow.glitch.me/data/tweets/:' + userId)
  ]).then(res => Promise.all(res.map(r => r.json())))
    .then(res => {
    console.log(res);
    render({
      user: res[0].user,
      tweets: res[1].tweets
    });
  });
}

function render(res) {
  console.log('rendering friend', res)
  let app = new Vue({
    el: '#friend',
    data: {
      user: res.user,
      tweets: res.tweets
    }
  });
}

let friendComp = Vue.component('friend-card', {
  data: function() {
    return {
      user: null,
      tweets: null
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
    getData(this.id);
  },
  watch: {
    id: function(newValue) {
      console.log('id changed');
      this.getData(newValue);
    }
  },
  template: `
    <div id='friend' v-cloak v-pre>
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