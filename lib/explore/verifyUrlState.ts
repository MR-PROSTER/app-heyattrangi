/**
 * Lightweight verification for Explore URL state helpers.
 * Run: npx tsx lib/explore/verifyUrlState.ts
 */

import {
  parseExploreMode,
  parseExploreCategory,
  parseExploreUrlState,
  buildExploreHref,
  buildActivityDetailHref,
} from "./urlState"

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg)
}

function params(qs: string) {
  return new URLSearchParams(qs)
}

// Mode
assert(parseExploreMode(null) === "activities", "null mode → activities")
assert(parseExploreMode("bogus") === "activities", "invalid mode → activities")
assert(parseExploreMode("read") === "read", "read mode ok")
assert(
  parseExploreMode("listen", { hideListen: true }) === "activities",
  "hidden listen falls back"
)
assert(
  parseExploreMode("read", { hideRead: true }) === "activities",
  "hidden read falls back"
)

// Category
assert(parseExploreCategory(null) === "all", "null category → all")
assert(parseExploreCategory("nope") === "all", "invalid category → all")
assert(parseExploreCategory("breathing") === "breathing", "breathing ok")

// Full parse
const s = parseExploreUrlState(params("mode=read&category=breathing&item=x"))
assert(s.mode === "read", "parse mode")
assert(s.category === "breathing", "parse keeps category value")
assert(s.item === "x", "parse item for read")

const s2 = parseExploreUrlState(params("mode=activities&item=should-drop"))
assert(s2.item === null, "item ignored for activities")

// Href builders
assert(buildExploreHref({ mode: "activities" }) === "/patient/library", "home href")
assert(
  buildExploreHref({ mode: "read" }) === "/patient/library?mode=read",
  "read href"
)
assert(
  buildExploreHref({ mode: "activities", category: "sleep" }) ===
    "/patient/library?category=sleep",
  "category href"
)
assert(
  buildActivityDetailHref("breathing") === "/explore/activities/breathing",
  "activity detail href"
)
assert(
  buildActivityDetailHref("box-breathing") ===
    "/explore/activities/breathing?mode=box",
  "legacy box href"
)

console.log("Explore URL state verification passed.")
