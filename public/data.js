function unfollow(userId) {
  fetch('https://tokimeki-unfollow.glitch.me/data/unfollow', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userId: userId
    })
  }
}

function addToList(userId, listId) {
}

export { unfollow };