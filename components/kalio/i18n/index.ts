/*
 * Argon's words, per language: the shared Kalio base (base/<lang>.ts, a copy
 * of new-shop-kits/i18n/kalio-base) plus Argon's own (argon.<lang>.ts, which
 * also overrides the base keys whose English Argon changed: "cart" for
 * "basket", "guides" for the journal, one store instead of sellers).
 * English is bundled; every other language is its own small chunk, fetched
 * only when a visitor picks it (lang-<code>.ts merges its two files).
 * A language the owner enables later: copy base/<code>.ts, write
 * argon.<code>.ts, add lang-<code>.ts and one line below.
 */
import baseEn from "./base/en";
import argonEn from "./argon.en";

export const EN: Record<string, string> = { ...baseEn, ...argonEn };

export const LOADERS: Record<string, () => Promise<any>> = {
  ar: () => import("./lang-ar"),
  hi: () => import("./lang-hi"),
  da: () => import("./lang-da"),
};
