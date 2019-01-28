let progressListId;

function saveQuick(ids, store) {
  store.setItem('kept_ids', JSON.stringify(ids));
  console.log('saved', JSON.parse(store.getItem('kept_ids')));
}

function saveList(ids, store) {
  return fetch('https://tokimeki-unfollow.glitch.me/data/save_progress', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user_ids: ids.reverse().slice(0,100),
      list_id: store.getItem('progressListId') || ''
    })
  }).catch(e => console.log('error', e))
    .then(res => res.json())
    .then(res => {
      if (res.status == 200) {
        store.setItem('progressListId', res.list_id || store.getItem('progressListId'));
        console.log('save list success', store.getItem('progressListId'));
      }
  });
}

function loadQuick(store) {
  console.log('loading', JSON.parse(store.getItem('kept_ids')));
  return JSON.parse(store.getItem('kept_ids'));
}

function loadList(store) {
  return fetch('https://tokimeki-unfollow.glitch.me/data/load_progress', {
    list_id: store.getItem('progressListId') || ''
  })
    .catch(e => console.log('error', e))
    .then(res => {
    if (res.json) {
      return res.json().user_ids;
    } else {
      // error! what to return?
    }
  });
}

export { saveQuick, saveList, loadQuick, loadList };