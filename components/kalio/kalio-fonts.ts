/*
 * Besti — typefaces.
 *
 * Archivo sets every word; Material Symbols Rounded draws Besti's own icons
 * (the `.ms` spans in components/besti). They are requested from the app at
 * start-up rather than from index.html: in production the Layout runs inside
 * the HTML Selldone renders for the shop, and index.html never reaches the
 * visitor. Selldone's own components keep their Material Icons (v-icon).
 */

const FONTS = [
  "https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&display=swap",
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..24,400..600,0..1,0&display=block",
];

function addLink(attrs: Record<string, string>) {
  if (document.head.querySelector(`link[href="${attrs.href}"]`)) return;
  const link = document.createElement("link");
  Object.entries(attrs).forEach(([key, value]) => link.setAttribute(key, value));
  document.head.appendChild(link);
}

addLink({ rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" });
for (const href of FONTS) addLink({ rel: "stylesheet", href });
