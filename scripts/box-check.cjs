// box-check.cjs — images stay in their boxes, and stacked icon rows share one left edge.
// (The owner, 10 November 2026: cameras in "Complete your purchase" ran past their boxes onto the names;
// "Pickup / Delivery / Limited…" rows did not start from one edge.)
//
// For every visible <img> on each page and state, at 1440 and 390:
//   SPILL    the image's box runs past the nearest box that draws something (a ground, an edge, a shadow)
//            and does not clip it (overflow visible) by more than 1px;
//   OVERLAP  the image covers words (an element with its own text) by more than 2px each way, unless
//            the words are an overlay on purpose (positioned absolute/fixed/sticky: badges, counters).
// For every vertical list of two or more rows that each start with an icon (.ms, .v-icon, svg, or a
// small img) followed by words:
//   ALIGN    the icons' left edges differ by more than 1px.
//
// Usage: node scripts/box-check.cjs <base> [home selector]
//   PAGES="home=/,category=/x-category,…"   (default: Argon's set)
//   WIDTHS=1440,390   STORAGE='{"argon-theme":"{\"palette\":\"argon\",\"mode\":\"dark\"}"}'
//   STATES=1 (default) also opens: the Shop menu, the phone menu, a quick-buy sheet, the cart drawer and
//   the cart page with a cart filled in the local store only (SHOP=<xapi name>, CART=<cart button>).
// Prints each finding and "TOTAL n". Deliver at 0.
const PW = process.env.PW || "D:/Kalio Sample Shop Claude/kalio-marketplace/node_modules/playwright";
const { chromium } = require(PW);
const base = (process.argv[2] || "http://localhost:9132").replace(/\/$/, "");
const WAIT = process.argv[3] || ".ar-cats";
const PAGES = (process.env.PAGES ||
  "home=/,category=/action-camera-category,deals=/?filter=%7B%22only_has_discount%22%3Atrue%7D,search=/?search=wireless,product=/product/710091,product2=/product/710058,compare=/comparison?list=p710091_p710089,blog=/blog,404=/no-such-page,faq=/faq,contact=/contact-us")
  .split(",").map((s) => s.split("="));
const WIDTHS = (process.env.WIDTHS || "1440,390").split(",").map(Number);
const SHOP = process.env.SHOP || "digini-hzgablru";
const CART = process.env.CART || ".ar-act.-cart";
const STATES = process.env.STATES !== "0";

function audit() {
  const vis = (el) => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return r.width > 2 && r.height > 2 && s.visibility !== "hidden" && s.display !== "none" && Number(s.opacity) > 0.05;
  };
  const shown = (el) => { for (let p = el; p && p !== document.documentElement; p = p.parentElement) { const s = getComputedStyle(p); if (s.display === "none" || s.visibility === "hidden" || Number(s.opacity) < 0.05) return false; } return true; };
  const name = (el) => (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".") : el.tagName.toLowerCase());
  const path = (el) => { const out = []; for (let p = el; p && out.length < 3 && p !== document.body; p = p.parentElement) out.unshift(name(p)); return out.join(" > "); };
  const out = [];
  /* SPILL and OVERLAP */
  const texts = [...document.querySelectorAll("body *")].filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1) && vis(e) && shown(e));
  /* The layer an element is drawn in: a fixed panel, a sheet, a drawer, a
     dropdown (positioned with a z-index). Words in one layer and a picture in
     another do not collide (a panel covers the page under it). */
  const layer = (el) => {
    for (let p = el; p && p !== document.body; p = p.parentElement) {
      const s = getComputedStyle(p);
      if (s.position === "fixed" || (s.position === "absolute" && Number(s.zIndex) >= 10) || p.classList.contains("v-overlay__content") || p.classList.contains("v-navigation-drawer")) return p;
    }
    return document.body;
  };
  const overlay = (el, stop) => { for (let p = el; p && p !== stop && p !== document.body; p = p.parentElement) { const pos = getComputedStyle(p).position; if (pos === "absolute" || pos === "fixed" || pos === "sticky") return true; } return false; };
  for (const img of document.querySelectorAll("img")) {
    if (!vis(img) || !shown(img)) continue;
    const r = img.getBoundingClientRect();
    let box = null;
    for (let p = img.parentElement; p && p !== document.body; p = p.parentElement) {
      const s = getComputedStyle(p);
      const pr = p.getBoundingClientRect();
      if (pr.width < 4 || pr.height < 4) continue;
      if (/(hidden|clip|auto|scroll)/.test(s.overflowX + s.overflowY)) { box = { p, clips: true }; break; }
      if (s.backgroundColor !== "rgba(0, 0, 0, 0)" || s.boxShadow !== "none" || parseFloat(s.borderTopWidth) > 0 || s.backgroundImage !== "none") { box = { p, clips: false }; break; }
    }
    if (box && !box.clips) {
      const b = box.p.getBoundingClientRect();
      const d = Math.max(b.left - r.left, r.right - b.right, b.top - r.top, r.bottom - b.bottom);
      if (d > 1) out.push(`SPILL ${Math.round(d)}px  ${path(img)} past ${name(box.p)}`);
    }
    for (const t of texts) {
      if (t.contains(img) || img.contains(t)) continue;
      if (layer(t) !== layer(img)) continue;
      const tr = t.getBoundingClientRect();
      const w = Math.min(r.right, tr.right) - Math.max(r.left, tr.left);
      const h = Math.min(r.bottom, tr.bottom) - Math.max(r.top, tr.top);
      if (w <= 2 || h <= 2) continue;
      /* words drawn over a picture on purpose (a positioned overlay), or a picture behind a block on purpose */
      let common = t.parentElement; while (common && !common.contains(img)) common = common.parentElement;
      if (overlay(t, common) || getComputedStyle(img).position === "absolute" && getComputedStyle(img).zIndex === "-1") continue;
      /* clipped away: the picture's visible part (inside its clipping box) does not reach the words */
      if (box && box.clips) { const b = box.p.getBoundingClientRect(); const vw = Math.min(b.right, tr.right) - Math.max(b.left, tr.left); const vh = Math.min(b.bottom, tr.bottom) - Math.max(b.top, tr.top); if (vw <= 2 || vh <= 2) continue; }
      out.push(`OVERLAP ${Math.round(w)}x${Math.round(h)}  ${path(img)} on "${t.textContent.trim().slice(0, 30)}"`);
    }
  }
  /* ALIGN */
  const iconOf = (row) => {
    const ic = row.querySelector(":scope > .ms, :scope > i, :scope > .v-icon, :scope > svg, :scope > img, :scope > span > .ms:first-child, :scope > .v-icon:first-child");
    if (!ic || !vis(ic)) return null;
    const r = ic.getBoundingClientRect();
    if (ic.tagName === "IMG" && r.width > 40) return null;
    const rr = row.getBoundingClientRect();
    if (r.left - rr.left > 40) return null; /* not the row's leading icon */
    return r;
  };
  const seen = new Set();
  for (const c of document.querySelectorAll("body *")) {
    if (!vis(c) || !shown(c)) continue;
    const rows = [...c.children].filter((k) => vis(k) && k.textContent.trim().length > 1);
    if (rows.length < 2) continue;
    const withIcon = rows.map((k) => ({ k, ic: iconOf(k) })).filter((x) => x.ic);
    if (withIcon.length < 2 || withIcon.length < rows.length * 0.6) continue;
    let stacked = true;
    for (let i = 1; i < withIcon.length; i++) if (withIcon[i].k.getBoundingClientRect().top < withIcon[i - 1].k.getBoundingClientRect().bottom - 2) stacked = false;
    if (!stacked) continue;
    const lefts = withIcon.map((x) => x.ic.left);
    const spread = Math.max(...lefts) - Math.min(...lefts);
    const key = path(c);
    if (spread > 1 && !seen.has(key)) {
      seen.add(key);
      out.push(`ALIGN ${spread.toFixed(1)}px  ${key} (${withIcon.map((x) => x.k.textContent.trim().slice(0, 14)).join(" | ")})`);
    }
  }
  return out;
}

const push = (pg, to) => pg.evaluate((to) => { const el = [...document.querySelectorAll("*")].find((e) => e.__vue_app__); el.__vue_app__.config.globalProperties.$router.push(to).catch(() => {}); }, to);

const fillCart = (pg) =>
  pg.evaluate(async (shop) => {
    const list = await fetch(`https://xapi.selldone.com/shops/@${shop}/products/list?limit=250`).then((r) => r.json());
    const ps = list.products || [];
    const now = Date.now();
    const live = (p) => p.discount > 0 && (!p.dis_end || Date.parse(p.dis_end) > now);
    const pick = [ps.find((p) => live(p)), ps.find((p) => (p.product_variants || []).some((v) => v.volume)), ps.find((p) => !live(p))].filter(Boolean);
    const items = pick.map((p, i) => {
      const v = (p.product_variants || [])[0] || null;
      const dis = live(p) ? p.discount : 0;
      const price = (v && v.pricing ? v.price : p.price) - dis;
      return { id: 900 + i, product_id: p.id, variant_id: v ? v.id : null, variant: v, count: i === 1 ? 2 : 1, price, dis, currency: p.currency || "USD", product: { id: p.id, title: p.title, icon: p.icon, type: "PHYSICAL", quantity: p.quantity, category_id: p.category_id } };
    });
    const total = items.reduce((s, it) => s + it.price * it.count, 0);
    const el = [...document.querySelectorAll("*")].find((e) => e.__vue_app__);
    el.__vue_app__.config.globalProperties.$store.commit("setBasketPhysical", { id: 1, type: "PHYSICAL", items, price: total, currency: items[0]?.currency || "USD", status: "Open", receiver_info: null, bill: null });
  }, SHOP);

(async () => {
  const b = await chromium.launch();
  let total = 0;
  const report = (label, list) => { for (const l of list) console.log(`${label}  ${l}`); total += list.length; };
  for (const w of WIDTHS) {
    const mob = w < 600;
    const ctx = await b.newContext({ viewport: { width: w, height: mob ? 844 : 900 }, deviceScaleFactor: 1, isMobile: mob, hasTouch: mob });
    if (process.env.STORAGE) await ctx.addInitScript((st) => { for (const [k, v] of Object.entries(JSON.parse(st))) localStorage.setItem(k, v); }, process.env.STORAGE);
    await ctx.route("**/buy/**", (r) => r.abort());
    const pg = await ctx.newPage();
    await pg.goto(base + "/", { waitUntil: "domcontentloaded", timeout: 90000 });
    await pg.waitForSelector(WAIT, { timeout: 90000 });
    for (const [label, to] of PAGES) {
      if (label !== "home") await push(pg, to);
      await pg.waitForTimeout(4500);
      await pg.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 800) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } window.scrollTo(0, 0); });
      await pg.waitForTimeout(800);
      report(`${w} ${label}`, await pg.evaluate(audit));
      if (label === "home") await push(pg, "/").catch(() => {});
    }
    if (STATES) {
      await push(pg, "/");
      await pg.waitForTimeout(3500);
      if (!mob) {
        await pg.click(".ar-nav__b[data-dd=shop]").catch(() => {});
        await pg.waitForTimeout(800);
        report(`${w} shop-menu`, await pg.evaluate(audit));
        await pg.keyboard.press("Escape");
        await pg.click(".ar-nav__b[data-dd=shop]").catch(() => {});
      } else {
        await pg.click(".ar-burger").catch(() => {});
        await pg.waitForTimeout(900);
        report(`${w} phone-menu`, await pg.evaluate(audit));
        await pg.click(".ar-menu .ar-x").catch(() => {});
      }
      await pg.waitForTimeout(500);
      const opened = await pg.evaluate(() => { const b = [...document.querySelectorAll(".ar-card .ar-btn")].find((x) => /Choose options/i.test(x.textContent)); if (b) { b.scrollIntoView(); b.click(); } return !!b; });
      if (opened) {
        await pg.waitForTimeout(3500);
        report(`${w} quick-buy`, await pg.evaluate(audit));
        await pg.keyboard.press("Escape");
        await pg.waitForTimeout(600);
      }
      await fillCart(pg);
      await pg.waitForTimeout(800);
      await pg.click(CART).catch(() => {});
      await pg.waitForTimeout(2500);
      report(`${w} cart-drawer`, await pg.evaluate(audit));
      await pg.keyboard.press("Escape");
      await push(pg, "/basket/PHYSICAL");
      await pg.waitForTimeout(4000);
      report(`${w} cart-page`, await pg.evaluate(audit));
    }
    await ctx.close();
  }
  await b.close();
  console.log(`TOTAL ${total}`);
})().catch((e) => { console.error("FAIL", e.message); process.exit(1); });
