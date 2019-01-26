function unfollow(userId) {
  console.log('unfollowing');
  fetch('https://tokimeki-unfollow.glitch.me/data/unfollow', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userId: userId
    })
  }).then(res => res.json())
    .then(res => console.log('unfollow response', res));
}

function addToList(userId, listId) {

}

function keep(userId) {
  
}

export { unfollow, addToList, keep };