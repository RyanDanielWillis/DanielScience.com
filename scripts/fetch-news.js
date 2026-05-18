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

const SOURCE_META = {
  "Full Disclosure": "Public vulnerability disclosures, exploit details, and security advisories from researchers and vendors worldwide.",
  "OSS Security": "Coordinated CVE disclosures, patches, and security fixes for open source software projects.",
  "InfoSec News": "Curated security headlines aggregated from major industry publications and researchers.",
  "NANOG": "North American network operators discussing routing, peering, BGP, infrastructure operations, and industry events.",
  "ipSpace.net": "Deep technical networking by Ivan Pepelnjak: BGP, EVPN, data center fabrics, SD-WAN, and cloud architecture.",
};

const MAX_ITEMS = 30;
const MAX_PER_SOURCE = 6;

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function extractTag(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return m ? decodeEntities(m[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim()) : "";
}

function cleanDescription(raw, title) {
  if (!raw) return "";
  let text = raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  // Strip mailing list header lines
  text = text.replace(/\b(From|To|Cc|Subject|Date|Message-Id|In-Reply-To|References|MIME-Version|Content-Type|Content-Transfer-Encoding)\s*:[^\n]{0,200}/gi, "");
  // Strip "Posted by X via Y on Z" intros common in seclists RSS
  text = text.replace(/Posted by\s.{0,120}\son\s\w+\s\d+/gi, "");
  // Strip the title from the start if RSS repeats it
  if (title) {
    const t = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    text = text.replace(new RegExp(`^\\s*${t}\\s*`, "i"), "");
  }
  text = text.replace(/\s+/g, " ").trim();
  if (text.length < 20) return "";
  return text.length > 240 ? text.slice(0, 237) + "…" : text;
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
    const description = cleanDescription(extractTag(block, "description"), title);
    if (title && link && link.startsWith("http")) {
      items.push({ title, link, ts, source: label, description });
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
    const description = cleanDescription(extractTag(block, "summary") || extractTag(block, "content"), title);
    if (title && link && link.startsWith("http")) {
      items.push({ title, link, ts, source: label, description });
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

  writeFileSync(OUT_PATH, JSON.stringify({ updated: new Date().toISOString(), sources: SOURCE_META, items }, null, 2));
  console.log(`Done — wrote ${items.length} items to news-data.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
