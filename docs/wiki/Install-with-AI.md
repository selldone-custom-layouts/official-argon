# Install with AI

An AI coding agent (for example **Claude Code** or **OpenAI Codex**) can set Argon up on your Selldone shop. It copies the repository, puts your brand name and theme in, builds it, uploads it with the official CLI and puts it live, while you do the few steps that need you. This page gives you what to prepare, a prompt to paste, and what to expect.

## 1. Prepare (10 minutes)

| You need | Why | Where |
| --- | --- | --- |
| A Selldone shop with products and categories | The Layout shows your live data | [selldone.com](https://selldone.com) |
| Your shop's **OAuth client id**, set up for the shop | Shopper sign-in. Without it, Sign in leaves for Selldone and shows an error. **Do this first.** | Shop dashboard (the shop's login / OAuth client settings), or the Selldone MCP connector (`selldone_shop_client_list`, `selldone_shop_client_create`) |
| Your shop's **handle** (the name in `name.myselldone.com`) and **shop id** | The agent uses them in `.env` and when attaching | Shop dashboard |
| Your brand name and theme | One line for the name, one file for the colours | You choose: a palette (`argon`, `cobalt`, `plum`, `teal`, `tangerine`) or a brand colour `#RRGGBB`, and light or dark |
| A GitHub account | Your own copy (fork) of this repository | [github.com](https://github.com) |
| A computer with **Git**, **Node.js 20+**, **Python 3** and **Bash** (Git Bash on Windows) | Building and packaging | — |
| An AI coding agent that can run terminal commands | Does the work | Claude Code, Codex… |
| Optional: the **Selldone MCP connector** for your shop | Lets the agent attach the Layout and set your Home page for you | [selldone.com/mcp/connections](https://selldone.com/mcp/connections) |

**Your part.** Only you should do these, and the agent will ask you when the time comes:

- **Sign in to the Selldone CLI.** Run `selldone`, choose **Login**, approve the sign-in in your browser and type your **2FA code**. Never give a password or code to the agent.
- **Approve the GitHub fork** (or create the repository yourself).
- **Attach the Layout to your shop,** unless the agent has the Selldone MCP connector.

**Your settings stay yours.** Guest checkout, payment methods, shipping methods and login modes are set by you in the dashboard. Argon works with whatever you choose (see [Shop Requirements](Shop-Requirements)); the agent must not change them.

## 2. Paste this prompt into your agent

Fill in the values in braces first.

```text
Set up the Selldone custom Layout "Argon Electronics" on my Selldone shop.

My shop handle: {SHOP_HANDLE}        (as in {SHOP_HANDLE}.myselldone.com)
My shop id: {SHOP_ID}
My GitHub account: {GITHUB_USER}
New Layout package name (lowercase, permanent, unique to me): {PACKAGE}   e.g. mybrand-electronics
My brand name: {BRAND_NAME}
My theme: {THEME}   e.g. palette "argon", light   or   brandColor "#F5C400", dark
Where it goes live: {WHERE}   "the whole shop"   or   one domain, e.g. shop.example.com

Source: https://github.com/selldone-custom-layouts/official-argon
It is based on the official Vue 3 storefront, https://github.com/selldone/storefront.

Before you change anything, read completely: README.md, ARGON.md, AGENTS.md (its "Theme"
section), KALIO.md, every file in docs/wiki/, and .ai-agent/AGENTS.md, .ai-agent/SKILL.md,
.ai-agent/AI_WORKFLOW.md.

Then:
0. Check that my shop has an OAuth client for sign-in (Selldone MCP: selldone_shop_client_list).
   If it has none, stop and tell me how to add it. Do not create one without asking me.
1. Fork the repository to my GitHub account (or create {GITHUB_USER}/{PACKAGE}) and clone it
   with submodules. Keep https://github.com/selldone/storefront as a fetch-only "upstream".
2. npm install --force. Put my shop in .env: VITE_APP_SAMPLE_SHOP_NAME={SHOP_HANDLE},
   and my currency, country and language. Run the dev server (npm run serve) and check the
   home, a category, a product page and the cart against my shop. Tell me what my shop's data
   is missing (see docs/wiki/Shop-Requirements.md) instead of hard-coding anything.
3. Brand: in components/kalio/kalio-brand.ts set BRAND.name to "{BRAND_NAME}". Change nothing
   else there. Replace assets/brand/argon-mark.svg only if I give you my own mark.
4. Theme: edit only components/argon/argon-theme.settings.ts, as AGENTS.md "Theme" says.
   Set my palette or brandColor (with textOnBrand), and mode. Keep themeSwitcher "showcase"
   unless I asked for my visitors to have the switcher ("on") or none ("off").
5. In manifest.json set "package" to {PACKAGE}, "name" to my shop's name plus "Electronics"
   (at least 8 characters), and "version" to 1.0.0. The package name is permanent after
   the first upload.
6. Install the official CLI (npm i -g selldone-cli) and clone https://github.com/selldone/cli
   for its packager. Ask me to sign in to the CLI myself (I type my 2FA code). Never print or
   store tokens, never type a password or 2FA code for me.
7. Release with: SELLDONE_CLI_SRC=<cli clone> bash scripts/release.sh 1.0.0 desk
   Read my new Layout id (printed after this first upload), then verify with
   LAYOUT_ID=<id> and scripts/kalio-verify-deploy.mjs: extracting false, error null,
   js_match and css_match true. Every later release: LAYOUT_ID=<id> SELLDONE_CLI_SRC=<cli clone>
   bash scripts/release.sh <new version> desk. Never reuse a version number.
8. Pin the exact version (never "latest"). For the whole shop: api.shops.layout.set, mode
   private, and make every domain inherit it. For one domain only:
   api.shops.domains.layout.set on that domain, and do not touch the shop default.
   Set Home to the shop page. Without the MCP connector, tell me the dashboard steps.
9. Open my shop's address without a query and confirm window.sdShopLayout names the new
   release. Check it on a phone-sized screen. If I chose a custom theme, run the contrast
   check from docs/wiki/Theme-and-colours.md; it must print TOTAL 0. Send me screenshots.
10. Commit and push to my repository. Report what you did, what you could not test, and what
   is mine to set (OAuth client, guest checkout, payment methods, shipping methods, login modes).

Do not change my shop's settings (guest checkout, payments, shipping, login modes). Do not
place real orders.
```

## 3. What the agent does

1. **Checks sign-in:** the shop's OAuth client, before anything else.
2. **Forks and clones** the repository with its Selldone submodules (`modules/*`).
3. **Installs and configures** `.env` for your shop, then runs the dev server on port 9132. In development the Layout reads your shop's public data from Selldone.
4. **Checks your data** against [Shop Requirements](Shop-Requirements): category icons, product photos, brands, variants, tags, specs for filters, deals.
5. **Sets your brand:** `BRAND.name` in `components/kalio/kalio-brand.ts` (the logo tile, page titles, footer and messages follow it).
6. **Sets your theme** in `components/argon/argon-theme.settings.ts` (see [Theme and colours](Theme-and-colours)).
7. **Sets your identity** in `manifest.json`: the package name, a display name and a first version.
8. **Releases** with `scripts/release.sh`: build, SVG flattening, safety checks, packaging, upload with the official CLI and a server check. See [Build and Upload](Build-and-Upload).
9. **Goes live** by pinning the exact version on your shop or one domain, and setting Home to the shop page. See [Go Live](Go-Live).
10. **Verifies** the live HTML and takes screenshots.

## 4. Check the result yourself

- Open your shop's address. You should see your logo tile, the category carousel and the promo cards, not Selldone's default home.
- Tap "Add to cart" on a card: it becomes "− 1 +" in place.
- Tap Sign in: it should open your shop's own sign-in, not an error on Selldone.
- Open the cart from the header and add an address on the map.
- Grey boxes with a file name in them are photo slots waiting for photos. See [Customize](Customize#the-photos).
- If something is off, see [Troubleshooting](Troubleshooting).

## Tips for working with the agent

- Let it work on its own: the prompt has everything it needs. Answer only the sign-in and attach steps.
- To change the colours later, ask in plain words ("make it dark", "my brand colour is #F5C400"). The agent edits one file and releases a new version.
- If you change your mind about a design, ask for **2–3 mockups first**, then pick one.
- Every new upload needs a **new version number**. Ask the agent to bump it each time.
