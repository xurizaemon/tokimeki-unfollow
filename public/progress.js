function save(ids, store) {
  store.setItem('kept', ids);
  
  return fetch('https://tokimeki-unfollow.glitch.me/data/save_progress', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userIds: ids
    })
  }).catch(e => console.log('error', e.stack))
    .then(res => res.json());
}

function load(store) {
  return ids;
}

export { save, load };