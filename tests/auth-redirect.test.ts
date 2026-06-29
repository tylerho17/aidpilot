import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getSafeAuthRedirectUrl } from "@/lib/auth-redirect";

const CALLBACK_URL = "https://aidpilot.example/auth/callback?code=abc";

function safeHref(nextPath: string | null) {
  return getSafeAuthRedirectUrl(CALLBACK_URL, nextPath).href;
}

describe("getSafeAuthRedirectUrl", () => {
  it("allows same-origin absolute paths", () => {
    assert.equal(safeHref("/dashboard"), "https://aidpilot.example/dashboard");
    assert.equal(
      safeHref("/scholarships?tab=new#matches"),
      "https://aidpilot.example/scholarships?tab=new#matches",
    );
  });

  it("falls back when next is missing or not an absolute path", () => {
    assert.equal(safeHref(null), "https://aidpilot.example/dashboard");
    assert.equal(safeHref("dashboard"), "https://aidpilot.example/dashboard");
    assert.equal(safeHref("@attacker.example"), "https://aidpilot.example/dashboard");
  });

  it("rejects external redirect forms", () => {
    assert.equal(safeHref("https://attacker.example/phish"), "https://aidpilot.example/dashboard");
    assert.equal(safeHref("//attacker.example/phish"), "https://aidpilot.example/dashboard");
    assert.equal(safeHref("/\\attacker.example/phish"), "https://aidpilot.example/dashboard");
  });
});
