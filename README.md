# TinkerPod design resources (branch `teamdesign`)

Static site, no build step. Vercel: Framework preset **Other**, root directory `./`, build command none, output directory `.` (repo root), production branch `teamdesign`.

Open `index.html` locally or run `python3 -m http.server` in this folder.

- `design/` approved mockups (html, png, assets, fx, motion) and `SCREENS.md`
- `design-pack/` logos, app icons, Captain Jetty moods, fx, sounds, empty states, talk lines, docs
- `downloads/` per-section zips and the full zip
- `thumbs/` gallery thumbnails, `docs/` rendered markdown, `site/` CSS + JS

Build tools and raw voice output are not included. Screens 33–48 had `../../design-pack/` image paths; those images were copied into `design/assets/{pip,empty,fx}/` and the HTML now points there.
