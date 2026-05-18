"use strict";
const { writeFileSync } = require("fs");
const { join } = require("path");

const OUT_PATH = join(__dirname, "..", "news-data.json");

const SOURCES = [
  { url: "https://seclists.org/rss/fulldisclosure.rss", label: "Full Disclosure" },
  { url: "https://seclists.org/rss/oss-sec.rss",        label: "OSS Security" },
  { url: "https://seclists.org/rss/isn.rss",            label: "InfoSec News" },
  { url: "https://seclists.org/rss/nanog.rss",          label: "NANOG" },
  { url: "https://blog.ipspace.net/atom.xml",           label: "ipSpace.net" },
];

const MAX_ITEMS = 9;
const MAX_PER_SOURCE = 3;

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extractTag(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return m ? decodeEntities(m[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim()) : "";
}

function parseRSS(xml, label) {
  const items = [];
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || [];
  for (const block of blocks) {
    const title = extractTag(block, "title");
    let link = extractTag(block, "link");
    if (!link) link = extractTag(block, "guid");
    const pubDate = extractTag(block, "pubDate");
    const ts = pubDate ? Date.parse(pubDate) : 0;
    if (title && link && link.startsWith("http")) {
      items.push({ title, link, ts, source: label });
    }
  }
  return items;
}

function parseAtom(xml, label) {
  const items = [];
  const blocks = xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) || [];
  for (const block of blocks) {
    const title = extractTag(block, "title");
    const linkMatch = block.match(/<link[^>]+href="([^"]+)"/i);
    const link = linkMatch ? linkMatch[1] : "";
    const updated = extractTag(block, "updated") || extractTag(block, "published");
    const ts = updated ? Date.parse(updated) : 0;
    if (title && link && link.startsWith("http")) {
      items.push({ title, link, ts, source: label });
    }
  }
  return items;
}

async function fetchFeed(source) {
  try {
    const res = await fetch(source.url, {
      headers: { "User-Agent": "DanielScience-news-fetcher/1.0" },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    return xml.includes("<entry") ? parseAtom(xml, source.label) : parseRSS(xml, source.label);
  } catch (err) {
    console.warn(`  [skip] ${source.label}: ${err.message}`);
    return [];
  }
}

async function main() {
  console.log("Fetching news feeds...");
  const results = await Promise.all(SOURCES.map(fetchFeed));
  const items = results
    .map((feed) => feed.filter((h) => h.ts > 0).slice(0, MAX_PER_SOURCE))
    .flat()
    .sort((a, b) => b.ts - a.ts)
    .slice(0, MAX_ITEMS);

  writeFileSync(OUT_PATH, JSON.stringify({ updated: new Date().toISOString(), items }, null, 2));
  console.log(`Done — wrote ${items.length} items to news-data.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
