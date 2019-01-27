function save() {
  
  
  fetch('https://tokimeki-unfollow.glitch.me' + url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(obj)
  }).catch(e => console.log('error', e.stack))
    .then(res => res.json())
    .then(res => {
    console.log('response', res);
    if (res.status == 200) {
      callback();
    }
  });
}

export { save };