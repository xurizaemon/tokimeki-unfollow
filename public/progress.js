// todo support setting to not use lists, but maybe dont return a promise?
// maybe two diff methods?
function save(ids, store) {
  store.setItem('kept');
  
  return fetch('https://tokimeki-unfollow.glitch.me/data/save_progress', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userIds: ids
    })
  }).catch(e => console.log('error', e))
    .then(res => res.json());
}

function load(store, useList) {
  store.getItem('kept')
  
  if (useList) {
  }
  return ids;
}

export { save, load };