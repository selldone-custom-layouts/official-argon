/* Argon in this language: the shared Kalio base and Argon's own words, one chunk. */
import base from "./base/da";
import own from "./argon.da";

export default { ...base, ...own } as Record<string, string>;
