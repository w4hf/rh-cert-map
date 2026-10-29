# Red Hat Certification Map

A client-side page that shows Red Hat certification progress for OpenShift, Enterprise Linux, Ansible, Cloud-Native Applications, and AI.

Use it at [https://w4hf.github.io/rh-cert-map/](https://w4hf.github.io/rh-cert-map/) or open `index.html` locally. No build step. If a new deploy looks stale, hard-refresh once; after that, `version.txt` reloads returning visitors.

## What it does

- Draws each product track from Technologist or Developer through Architect. A level that is only partly done is marked in progress.
- Verifies a Certification ID (`###-###-###`; dashes are inserted as you type) against [rhtapps.redhat.com/verify](https://rhtapps.redhat.com/verify). Current credentials fill the map, the exam transcript fills Other Exams, and credentials that are not on the map stay in Legacy Credentials with an expiry badge.
- Opens `?certId=###-###-###` already verified, for example [https://w4hf.github.io/rh-cert-map/?certId=140-255-795](https://w4hf.github.io/rh-cert-map/?certId=140-255-795).
- Shows requirements when you hover or focus a map node. An active certificate also shows its expiry date.
- Lets you check exams by hand. The sidebar can search, sort, and group by product, level, or a flat list.
- Resize the desktop sidebar by dragging the divider beside the map; its width is remembered. The focused divider also supports arrow keys, Home/End, and double-click to reset. Small screens retain the overlay sidebar.
- Keeps exams, expiry dates, appearance, and the sidebar in `localStorage`. The Appearance menu offers Default or Project Felt, System/Light/Dark color schemes, and System/Default/High contrast/Glass contrast modes. System settings update live; system high contrast and reduced transparency preferences take priority over Glass. Existing light/dark selections are preserved.

## Stack

[PatternFly 6.7.0](https://www.patternfly.org/) and Font Awesome from a CDN. Both PatternFly stylesheets are pinned to 6.7.0 with SHA-384 integrity hashes. Red Hat Text and Red Hat Mono come with PatternFly. The page itself is vanilla JavaScript.

## Deploy

Bump the number in `version.txt`. The next visit reloads, and `style.css`, `cert-logic.js`, and `app.js` are requested with that version.

`theme.js` loads before the stylesheets to apply saved appearance settings before the first paint. When changing it, also bump its `?v=` value in `index.html`.

## Checks

Run `node --test theme.test.cjs` for appearance preference checks. Open `logic.test.html` in a browser for certification logic checks.

## Files

```
index.html         # Page
style.css          # Layout and brand colors
theme.js           # Appearance preferences, system settings, and menu
theme.test.cjs     # Appearance preference checks (Node.js)
cert-logic.js      # Exam rules, matching, and legacy filtering
logic.test.html    # Checks for cert-logic.js
app.js             # Map, verification, and sidebar
redhat-favicon.png # Logo and favicon
version.txt        # Deploy version
```
