# Go Live

An uploaded version changes nothing until it is **attached** to your shop, or to one domain of it.

Before you go live, check that your shop's **OAuth client id** is set up (see [Shop Requirements](Shop-Requirements)). Without it, Sign in on the Layout leaves for Selldone and shows an error.

## 1. Attach the version

**In the dashboard:** shop › **Domains** › **Default layout** › **Change layout**. Pick your Layout and the exact version.

**With the Selldone MCP connector:**

1. Confirm that `selldone_current_connection` returns **your** shop id. The connector picks the shop from its own connection, not from anything you pass.
2. Call `selldone_api_call` → `api.shops.layout.set`, with `confirm: true` and this body:

```json
{ "mode": "private", "layout_id": <your Layout id>, "layout_version": "1.0.1" }
```

Your Layout id is the one printed after your first upload. Pin the **exact** version, never `latest`, so an unverified upload never goes live. Read `api.shops.layout.options` before and after.

## Two Layouts on one shop (how Argon runs)

A shop can show a different Layout on one of its domains. Argon lives only on `argon.selldone.shop` (domain 1241 of the shop Digini; Argon's Layout id: see `ARGON.md`), while the shop's default and its other domains carry other Layouts:

```json
api.shops.domains.layout.set   path { "domain_key": "<the domain's id>" }
body { "mode": "private", "layout_id": <your Layout id>, "layout_version": "1.0.1" }
```

That domain's own Home can be set too: `selldone_shop_home_domain_set` with `domain_address` and `page_id: "shop"`.

Then **don't** pin the shop default when you release this Layout: that would move every other address too. Check both addresses' `window.sdShopLayout` after a release.

## 2. Make every domain inherit it (whole-shop setup)

A custom domain **keeps its own Layout selection**. It can stay on an old version while the shop moves on.

- Set each domain to **inherit**: `api.shops.domains.layout.set` with `{ "mode": "inherit" }`, or the same setting on the domain in the dashboard.
- Check every address after a release: `name.myselldone.com`, your custom domain, and any sub-domain.

Skip this step for a domain that carries its own Layout on purpose (as above).

## 3. Home = Shop page

If `/` shows a Page Builder landing page while `/shop` shows the Layout, the shop's Home is a page. Set it to the shop page:

- in the dashboard, set **Home** to **Shop**;
- or call `selldone_shop_home_default_set` with `page_id: "shop"` (for one domain: `selldone_shop_home_domain_set`).

## 4. Verify

Open your shop's address **without a query** (a query shows the catalogue instead of the home). Then:

- the page source's `window.sdShopLayout` → `"saved"` block names your package and the new version;
- the header shows your logo tile, and the home starts with the category carousel;
- no blank page and no flash of an old design;
- Sign in opens your shop's own sign-in;
- check on a phone-sized screen too.

A headless browser that opens a `/product/` link directly gets Selldone's SEO page, not the Layout. Open the home first and move with the Layout's own links, or test in a normal browser.

## Custom domain on Cloudflare (example: `name.selldone.shop`)

1. Create an **A** record to `34.117.142.64`, **DNS only** (proxy off).
2. Create the **TXT** record Selldone gives you (`<sub>-challenge.<zone>`).
3. Add the domain with `selldone_domain_add`, `ssl_proxy: true`, or in the dashboard. HTTPS is issued within seconds.

Plain HTTP serves the shop too. The first custom domain becomes primary. Then either make the domain **inherit** the shop's Layout (step 2) or give it its own (the section above).
