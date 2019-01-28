function saveQuick(ids, store) {
  store.setItem('kept_ids', JSON.stringify(ids));
  console.log('saved', JSON.parse(store.getItem('kept_ids')));
}

function saveList(ids) {
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

function loadQuick(store) {
  console.log('loading', JSON.parse(store.getItem('kept_ids')));
  return JSON.parse(store.getItem('kept_ids'));
}

function loadList(store, useList) {
  return fetch('https://tokimeki-unfollow.glitch.me/data/load_progress')
    .catch(e => console.log('error', e))
    .then(res => {
    if (res.json) {
      return res.json()
    } else {
      // error! what to return?
    }
  });
}

export { saveQuick, saveList, loadQuick, loadList };