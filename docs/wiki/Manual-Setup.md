# Manual Setup

Set Argon up on your shop yourself. Follow these steps in order, or let an agent do it: [Install with AI](Install-with-AI).

## 0. Before you start: sign-in

Set up your shop's **OAuth client id** first (in the shop dashboard's login / OAuth client settings, or with the Selldone MCP connector's `selldone_shop_client_list` and `selldone_shop_client_create`). Without it, Sign in on the Layout leaves for Selldone and shows an error.

Guest checkout, payment methods, shipping methods and login modes are your settings. Argon handles each choice; see [Shop Requirements](Shop-Requirements).

## 1. Get your own copy

Fork **selldone-custom-layouts/official-argon** on GitHub, then clone your fork with its submodules:

```bash
git clone --recurse-submodules https://github.com/<you>/<your-repo>.git
cd <your-repo>
git remote add upstream https://github.com/selldone/storefront.git
git remote set-url --push upstream DISABLED
```

- `origin` is your repository.
- `upstream` is Selldone's official storefront, used to fetch updates only.
- Never commit inside `modules/*`. A fix there is kept as a patch in `patches/`.

## 2. Install

```bash
npm install --force
```

Node.js 20 or newer. On Windows use Git Bash for the shell scripts.

## 3. Point development at your shop

Edit `.env`. These are public client values, read only in development; in production Selldone injects the shop that runs the Layout.

```dotenv
VITE_APP_SAMPLE_SHOP_NAME=<your shop handle>
VITE_APP_SAMPLE_SHOP_CUSTOM_HOME=shop
VITE_APP_SAMPLE_DEFAULT_CURRENCY=USD
VITE_APP_SAMPLE_DEFAULT_COUNTRY=US
VITE_APP_SAMPLE_DEFAULT_LANGUAGE=en
VITE_APP_DEV_SERVER_PORT=9132
```

`.env.development.local` picks the buyer-account design for development: `VITE_KALIO_ACCOUNT=desk` (side rail, the one Argon ships) or remove it for `home` (tabs).

## 4. Your brand and theme

- **Name:** `components/kalio/kalio-brand.ts`, `BRAND.name = "Argon"`. Put your name there. The logo tile, page titles, footer and messages follow it. `null` keeps your shop's own title.
- **Mark:** `assets/brand/argon-mark.svg` (the tab icon and the avatar on order messages). Replace it with your own 64×64 SVG, or keep it.
- **Theme:** `components/argon/argon-theme.settings.ts`, the one file for colours, light or dark and the visitor switcher. See [Theme and colours](Theme-and-colours).

## 5. Run it

```bash
npm run serve
```

Open <http://localhost:9132>. Check the home, a category, a product page, the cart and the account against your shop. If a section is missing, see [Shop Requirements](Shop-Requirements). Grey boxes with a file name are photo slots: see [Customize](Customize#the-photos).

## 6. Give the Layout your identity

In `manifest.json`:

```json
{
  "package": "mybrand-electronics",
  "name": "Mybrand Electronics",
  "version": "1.0.0",
  "storefront": true,
  "backoffice": false,
  "description": "One sentence about your storefront."
}
```

- `package`: lowercase, unique to you, and **permanent after the first upload**.
- `name`: at least 8 characters.
- `version`: new for every upload, never reused.

## 7. Release and go live

1. [Build and Upload](Build-and-Upload). The first time: `SELLDONE_CLI_SRC=<cli clone> bash scripts/release.sh 1.0.0 desk`. After that, with the id printed after the first upload: `LAYOUT_ID=<your Layout id> SELLDONE_CLI_SRC=<cli clone> bash scripts/release.sh <new version> desk`.
2. [Go Live](Go-Live): pin the exact version on your shop (or one domain of it), and set Home to the shop page.

## 8. Keep up with Selldone

```bash
git fetch upstream main --tags --prune
git merge --no-ff upstream/main
```

Resolve conflicts by keeping Argon's templates and Selldone's logic. Then re-apply the patches if the submodules changed:

```bash
git -C modules/components apply ../../patches/modules-components.kalio.patch
git -C modules/translate apply ../../patches/modules-translate.kalio.patch
```

A patch that no longer applies must be redone by hand, not skipped.
