export function init(userId) {
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