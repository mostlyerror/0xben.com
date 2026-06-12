import test from "node:test";
import assert from "node:assert/strict";
import { escapeXml, buildRssXml } from "./rss.ts";

test("escapeXml escapes all five XML special characters", () => {
  assert.equal(
    escapeXml(`a & b < c > d " e ' f`),
    "a &amp; b &lt; c &gt; d &quot; e &apos; f",
  );
});

test("escapeXml leaves plain text untouched", () => {
  assert.equal(escapeXml("shipped a thing"), "shipped a thing");
});

test("buildRssXml produces a valid channel with escaped items", () => {
  const xml = buildRssXml({
    title: "Ben & co",
    link: "https://0xben.com",
    description: "ships",
    entries: [
      { date: "Jun 10, 2026", what: "Launched <Growthdeck>", href: "https://growthdeck.0xben.com" },
      { date: "Jun 9, 2026", what: "No link entry" },
    ],
  });
  assert.ok(xml.startsWith(`<?xml version="1.0" encoding="UTF-8"?>`));
  assert.match(xml, /<title>Ben &amp; co<\/title>/);
  assert.match(xml, /<title>Launched &lt;Growthdeck&gt;<\/title>/);
  // Entry without href falls back to the site link.
  assert.equal(xml.match(/<link>https:\/\/0xben\.com<\/link>/g)?.length, 2);
  // RFC822-style date from "Jun 10, 2026".
  assert.match(xml, /<pubDate>Wed, 10 Jun 2026/);
});

test("buildRssXml omits pubDate for an unparseable date", () => {
  const xml = buildRssXml({
    title: "t",
    link: "https://0xben.com",
    description: "d",
    entries: [{ date: "Jun 32, 2026", what: "typo entry" }],
  });
  assert.doesNotMatch(xml, /Invalid Date/);
  assert.doesNotMatch(xml, /<pubDate>/);
  assert.match(xml, /<title>typo entry<\/title>/);
});

test("buildRssXml prefers the gloss as the item title", () => {
  const xml = buildRssXml({
    title: "t",
    link: "https://0xben.com",
    description: "d",
    entries: [{ date: "Jun 1, 2026", what: "raw log line", gloss: "plain language line" }],
  });
  assert.match(xml, /<title>plain language line<\/title>/);
  assert.doesNotMatch(xml, /raw log line/);
});
