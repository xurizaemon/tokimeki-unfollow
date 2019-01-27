// todo support setting to not use lists, but maybe dont return a promise?
// maybe two diff methods?
function save(ids, store, useList) {
  if (!useList) {
    store.setItem('kept_ids', ids);
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
  let storeIds = store.getItem('kept_ids');
  
  if (!useList) {
    return storeIds || [];
  } else {
    return storeIds || [];
  }
}

export { save, load };