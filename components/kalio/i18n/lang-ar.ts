/* Argon in this language: the shared Kalio base and Argon's own words, one chunk. */
import base from "./base/ar";
import own from "./argon.ar";

export default { ...base, ...own } as Record<string, string>;
