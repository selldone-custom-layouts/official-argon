/* Argon in this language: the shared Kalio base and Argon's own words, one chunk. */
import base from "./base/hi";
import own from "./argon.hi";

export default { ...base, ...own } as Record<string, string>;
