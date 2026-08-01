/**
 * Lightweight verification for Profile deep-link helpers.
 * Run: npx tsx lib/profile/verifyProfileDeepLinks.ts
 */

import {
  buildProfileHash,
  isProfileSectionId,
  isSectionAvailable,
  parseProfileHash,
} from "./sections"

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg)
}

assert(parseProfileHash("") === null, "empty hash → null")
assert(parseProfileHash("#") === null, "bare # → null")
assert(parseProfileHash("#identity") === "identity", "identity ok")
assert(parseProfileHash("#mind-matrix") === "mind-matrix", "mind-matrix ok")
assert(parseProfileHash("#preferences") === "preferences", "preferences ok")
assert(parseProfileHash("#privacy") === "privacy", "privacy ok")
assert(parseProfileHash("#account") === "account", "account ok")
assert(parseProfileHash("#membership") === "membership", "membership ok")
assert(parseProfileHash("#emergency") === "emergency", "emergency ok")
assert(parseProfileHash("#bogus") === null, "invalid → null")
assert(parseProfileHash("#Identity") === "identity", "case-insensitive")
assert(parseProfileHash("preferences") === "preferences", "without #")
assert(buildProfileHash("identity") === "#identity", "build hash")
assert(isProfileSectionId("identity"), "isProfileSectionId identity")
assert(!isProfileSectionId("nope"), "isProfileSectionId rejects")
assert(
  isSectionAvailable("emergency", { showEmergency: false }) === false,
  "emergency gated off"
)
assert(
  isSectionAvailable("emergency", { showEmergency: true }) === true,
  "emergency gated on"
)
assert(
  isSectionAvailable("identity", { showEmergency: false }) === true,
  "identity always on"
)

console.log("verifyProfileDeepLinks: all checks passed")
