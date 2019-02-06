# Tokimeki Unfollow
> KonMari your Twitter follows

## Technical overview
Uses Vue.js & Express.js.

### Server
Server-side, there are 3 main elements, that `server.js` uses from `routes/`:
- `twitter-login.js` handles Twitter authentication. Uses cookies to store login session info.
- `twitter-api.js` has endpoints for the clientside to talk to Twitter through the server. This way, we can store the authentication stuff securely in the cookies/`🔑.env` and not expose them in the client.
- `db.js` has endpoints that use SQLite3 to save progress and sync that progress across any browser someone logs in from.

### Client
There are two main pages that people will load:
- The logged-out 'home page', which is built from `views/index.pug` and `views/layout.pug`. *I probably should've just been an HTML, but I didn't know that Vue didn't play well with Pug until after I implemented Pug.*
- The actual application for Tokimeki Unfollow, which starts with `public/views/review.html`, which uses `public/client.js` to define the main Vue application, data, and logic.
  - It uses a variety of Vue components defined in `public/views`.

In addition, there are some modules under `public/modules` that help with talking to the server:
- `data.js` talks to `twitter-api.js` and handles all Twitter API requests.
- `progress.js` handles saving/loading progress from the server's `db.js` & `window.localStorage`.

## Setup
If you Remix, you'll need a [Twitter developer account](https://developer.twitter.com/en/apply-for-access.html), which takes some time for acceptance.
- After you get approved, you can make an app and add the app `KEY` and `SECRET` to `🔑.env`.
  - Make sure to define the callback URLs for the Twitter app, i.e. `https://tokimeki-unfollow.glitch.me/auth/twitter/callback`, and update that URL in `twitter-api.js` line 7, too.
- Then, set your own `DB_USER` and `DB_PASS` for the progress saving in `db.js`

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