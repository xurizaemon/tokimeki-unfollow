function saveQuick(kept_ids, unfollowed_ids, start_count, current_session_count, store) {
  store.setItem('kept_ids', JSON.stringify(kept_ids));
  store.setItem('unfollowed_ids', JSON.stringify(unfollowed_ids));
  if (start_count > JSON.parse(store.getItem('start_count'))){
    store.setItem('start_count', JSON.stringify(start_count));
  }
  store.setItem('current_session_count', JSON.stringify(current_session_count));
  console.log('saved to localStorage', JSON.parse(store.getItem('kept_ids')),
              JSON.parse(store.getItem('unfollowed_ids')),
             JSON.parse(store.getItem('start_count')));
}

function saveServer(kept_ids, unfollowed_ids, start_count) {
  fetch('https://tokimeki-unfollow.glitch.me/data/progress/save', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      kept_ids: kept_ids,
      unfollowed_ids: unfollowed_ids,
      start_count: start_count
    })
  }).catch(e => console.log('error', e))
    .then(res => res.json())
    .then(res => {
      if (res.status == 200) {
        console.log('Saved to server');
      } else {
        console.log('Error saving to server');
      }
  });
}

function loadQuick(store) {
  let kept = JSON.parse(store.getItem('kept_ids'));
  let unfollowed = JSON.parse(store.getItem('unfollowed_ids'));
  let start_count = JSON.parse(store.getItem('start_count'));
  let current_session_count = JSON.parse(store.getItem('current_session_count'));
  console.log('loaded', kept, unfollowed);
  return {
    kept: kept,
    unfollowed: unfollowed,
    start_count: start_count,
    current_session_count: current_session_count
  };
}

function loadServer() {
  return fetch('https://tokimeki-unfollow.glitch.me/data/progress')
    .catch(e => console.log('error', e))
    .then(res => res.json());
}

export { saveQuick, saveServer, loadQuick, loadServer };