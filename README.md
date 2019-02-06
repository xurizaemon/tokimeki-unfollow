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
- **Logged-out 'home page'**: is built from `views/index.pug` and `views/layout.pug`. *I probably should've just been an HTML, but I didn't know that Vue didn't play well with Pug until after I implemented Pug.*
- **Main application**: which starts with `public/views/review.html` and uses `public/client.js` to define the main Vue application, data, and logic.
  - `review.html` then includes a variety of Vue components defined in `public/views`, from the `intro` and `finish` screen, to the `tweets` widget.

In addition, there are some modules under `public/modules` that help with talking to the server:
- `data.js` talks to `twitter-api.js` and handles all Twitter API requests.
- `progress.js` handles saving/loading progress from the server's `db.js` & `window.localStorage`.

Also, there's some straight-forward CSS. I mixed some modular classes with some old fashioned non-modular CSS, so don't judge me too hard.

## Setup
If you Remix, you'll need a [Twitter developer account](https://developer.twitter.com/en/apply-for-access.html), which takes some time for acceptance.
- After you get approved, you can make an app and add the app `KEY` and `SECRET` to `🔑.env`.
  - Make sure to define the callback URLs for the Twitter app, i.e. `https://tokimeki-unfollow.glitch.me/auth/twitter/callback`, and update that URL in `twitter-api.js` line 7, too.
- Then, set your own `DB_USER` and `DB_PASS` in `🔑.env` for the progress saving in `db.js`

## Gotchas
- If you've never used Promises, there are a bunch in this app. I kept on using Promises like callbacks and I kept screwing up. It took me about 2 weeks to really get used to it. They are strange, but fascinating.
- Twitter rate limits are poorly documented if not inaccurate, especially for `POST` requests. They say it's a 15 reqs/15 min for `POST`, but in practice, users have unfollowed 100+ accounts within 15 minutes with no problem. Googling shows that this rate is variable.
- Twitter lists API is really unreliable. If you try to bulk-add a bunch of members at once, chances are it will arbitrarily only add a portion of those members. It is a known issue and it's the reason I had to use SQLite3 in `db.js`, instead of using Twitter lists to save progress data.
- Instagram, Facebook, and LinkedIn have all been prime candidates for a similar tool, but all of their APIs are locked down and do not support this type of application. However unstable Twitter's API is, at least I was able to build this tool.
- As with all code-bases, there's some janky stuff. I don't use camel/underscore/kebab case consistently, there's some fancy iframe resizing code in `tweets.js` to get Twitter embeds in iOS to scroll smoothly.

---

## Todos
- Load state for initial application login (instead of blank gray screen) - wasn't an issue in development, but the app has been slowing down
- Keyboard shortcuts + documentation (probably stick it under new advanced options section that's collapsed by default)
- YOLO mode (skip confirmation step, also stick in advanced options)

---

## Feature requests that I probably won't build, but you should REMIX and build yourself!
- Add [Mute] action
- Add [Disable RTs] action
- *Insert your idea here!*

---
A tool by [Julius Tarng](https://tarng.com)