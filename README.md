# Tokimeki Unfollow
> KonMari your Twitter follows

## Setup
Uses Vue.js & Express.js.

Server-side, there are 3 main elements, that `server.js` uses:
- `twitter-login.js` for Twitter authentication. Uses cookies to store login session info.
- `twitter-api.js` endpoints for the clientside to talk to Twitter through the server. This way, we can store the authentication stuff securely in the cookies/`🔑.env` and not expose them in the client.
- `db.js` 

## Developing
If you Remix, you'll need a [Twitter developer account](https://developer.twitter.com/en/apply-for-access.html), which takes some time for acceptance. After you get approved, you can make an app and add the app `KEY` and `SECRET` to `🔑.env`. Then, set your own `DB_USER` and `DB_PASS` for the save data



---

## Todos
- Keyboard shortcuts
- YOLO mode (skip confirmation step)

---

## Feature requests that I probably won't build, but you should REMIX and build yourself!
- Add [Mute] action
- Add [Disable RTs] action
- *Insert your idea here!*

---
A tool by [Julius Tarng](https://tarng.com)