// todo support setting to not use lists, but maybe dont return a promise?
// maybe two diff methods?
function save(ids, store, useList) {
  // Use localStore even when using lists (as backup)
  store.setItem('kept_ids', JSON.stringify(ids));
  
  if (!useList) {  
    return new Promise((resolve, reject) => {
      resolve({
        status: 200
      });
    });
  } else {
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
}

function load(store, useList) {
  let storeIds = JSON.parse(store.getItem('kept_ids'));
  
  if (!useList) {
    return new Promise((resolve, reject) => {
      resolve({
        user_ids: storeIds || []
      });
    });
  } else {
    return fetch('https://tokimeki-unfollow.glitch.me/data/load_progress')
      .catch(e => console.log('error', e))
      .then(res => res.json())
  }
}

export { save, load };