# Build and Upload

Every release is a **new version** of your Layout on Selldone. `scripts/release.sh` runs every step in order; this page explains each one.

## One-time setup

```bash
npm i -g selldone-cli                                  # the official CLI
git clone https://github.com/selldone/cli selldone-cli-src   # its packager lives in .agents/
```

Sign in to the CLI once:

1. Run `selldone`.
2. Choose **Login | Login to your Selldone account.**
3. Approve the sign-in in your browser and type your **2FA code** in the terminal.

`selldone login` is not a command. The sign-in is saved in `~/.selldone-dev/.persist`; if that file is empty, every upload answers 401 until you sign in again.

## Release

```bash
SELLDONE_CLI_SRC=../selldone-cli-src LAYOUT_ID=<your layout id> \
  bash scripts/release.sh 1.0.1 desk
```

The arguments:
- the **new version**, never used before;
- the **account design**: `desk` (side rail) or `home` (tabs).

Leave `LAYOUT_ID` out on the very first upload. Afterwards, read your Layout's id from the Selldone developer panel.

## What the script does, and why

| Step | Why |
| --- | --- |
| Bump `version` in `manifest.json` | A version number is used up even when an upload fails. Never reuse one. |
| `npm run build-production` | Outputs `dist/app/shop.js`, `shop.css` and chunks with a **relative base**. Releases are served from `cdn.selldone.com/public/layouts/<id>/releases/<ULID>/app/`. |
| `rm dist/index.html` | Every ZIP member must be under `app/`. In production the Layout runs inside Selldone's HTML, so `index.html` is never used. Fonts load from the app code. |
| `scripts/kalio-svg-flatten.mjs` | Selldone accepts only passive SVG attributes. `style`, `<style>`, `xml:space`, `enable-background`, `display`, `fx/fy`, `data-*` and character references in values are refused. |
| MIME check (`file --mime-type`) | Selldone stores the MIME type it sniffs. A chunk starting with `import{` is stored as `text/x-java`, which browsers refuse. Every chunk starts with `"use strict";` (`sniffAsJavaScript` in `vite.config.ts`). |
| No `../shop.js` imports | Selldone's loader reaches `shop.js` through a redirect. A chunk importing `../shop.js` loads the app twice: an old page flashes, then the page goes blank. Shared code lives in a `core` chunk. |
| File count under ~360 | The archive is extracted inside the upload request, behind a ~100 s limit. At 714 files it was cut off mid-way and the version was burned. |
| `package_layout.py … --force` | Without `--force`, an old `dist.zip` is kept and it still prints PASS. |
| `cmp` of `shop.js` | Proves the ZIP is this build. |
| `scripts/kalio-deploy.mjs` | Uploads with the official CLI's sign-in and checks, sending the manifest in the form the server accepts. |
| `scripts/kalio-verify-deploy.mjs` | Asks the server: the newest deploy must show `extracting:false`, `error:null`, `js_match:true` and `css_match:true`. **A CLI exit code is not proof.** |

## Upload rules found by testing (November 2026)

- `manifest` holds only `package, version, name, description, storefront, backoffice`.
- No spaces or brackets in any file name (`safeName` in `vite.config.ts`).
- The `package` name never changes after the first upload.
- An upload creates a **beta** version. Your shop doesn't change until you attach it: see [Go Live](Go-Live).

## Preview a release before it is live

```bash
node --use-system-ca scripts/kalio-live-preview.mjs <release-ULID> 9125
```

This serves your shop's real HTML with the loader pointed at that release. The ULID is in the deploy path that `kalio-verify-deploy.mjs` prints.
