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

const MAX_ITEMS = 500;
const MAX_PER_SOURCE = 100;
const SUMMARY_CONCURRENCY = 5;

// Load Anthropic SDK if available
let Anthropic = null;
try { Anthropic = (require("@anthropic-ai/sdk").default || require("@anthropic-ai/sdk")); } catch (_) {}

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

function cleanRaw(raw, title) {
  if (!raw) return "";
  let text = raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  text = text.replace(/\b(From|To|Cc|Subject|Date|Message-Id|In-Reply-To|References|MIME-Version|Content-Type|Content-Transfer-Encoding)\s*:[^\n]{0,200}/gi, "");
  text = text.replace(/Posted by\s.{0,120}\son\s\w+\s\d+/gi, "");
  if (title) {
    const t = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    text = text.replace(new RegExp(`^\\s*${t}\\s*`, "i"), "");
  }
  text = text.replace(/\s+/g, " ").trim();
  return text.length < 20 ? "" : text.slice(0, 500);
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
    const raw = cleanRaw(extractTag(block, "description"), title);
    if (title && link && link.startsWith("http")) {
      items.push({ title, link, ts, source: label, raw });
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
    const raw = cleanRaw(extractTag(block, "summary") || extractTag(block, "content"), title);
    if (title && link && link.startsWith("http")) {
      items.push({ title, link, ts, source: label, raw });
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

async function summarise(client, item) {
  if (!client) { item.description = item.raw; return; }
  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 120,
      messages: [{
        role: "user",
        content: `Write a 1-2 sentence plain-English summary of what this security or networking news item is actually about. Be specific — name what software, protocol, or topic is involved and what's happening. Don't start with "This post" or "This article".

Title: ${item.title}
Context: ${item.raw || "(no further context)"}

Summary:`,
      }],
    });
    item.description = msg.content[0].text.trim();
  } catch (err) {
    console.warn(`  [summary] failed for "${item.title.slice(0, 40)}": ${err.message}`);
    item.description = item.raw;
  }
}

async function main() {
  // Load previous data as summary cache so we never re-summarise already-processed items
  const summaryCache = {};
  try {
    const prev = JSON.parse(require("fs").readFileSync(OUT_PATH, "utf8"));
    for (const item of (prev.items || [])) {
      if (item.link && item.description) summaryCache[item.link] = item.description;
    }
    console.log(`Loaded ${Object.keys(summaryCache).length} cached summaries.`);
  } catch (_) {}

  console.log("Fetching news feeds...");
  const results = await Promise.all(SOURCES.map(fetchFeed));
  const items = results
    .map((feed) => feed.filter((h) => h.ts > 0).slice(0, MAX_PER_SOURCE))
    .flat()
    .sort((a, b) => b.ts - a.ts)
    .slice(0, MAX_ITEMS);

  // Apply cache hits immediately; collect only uncached items for API calls
  const needSummary = [];
  for (const item of items) {
    if (summaryCache[item.link]) {
      item.description = summaryCache[item.link];
    } else {
      needSummary.push(item);
    }
  }

  const client = Anthropic && process.env.ANTHROPIC_API_KEY
    ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    : null;

  if (needSummary.length) {
    if (client) {
      console.log(`Generating summaries for ${needSummary.length} new items...`);
      for (let i = 0; i < needSummary.length; i += SUMMARY_CONCURRENCY) {
        await Promise.all(needSummary.slice(i, i + SUMMARY_CONCURRENCY).map((item) => summarise(client, item)));
        process.stdout.write(`  ${Math.min(i + SUMMARY_CONCURRENCY, needSummary.length)}/${needSummary.length}\r`);
      }
      console.log("\nSummaries done.");
    } else {
      console.log("No ANTHROPIC_API_KEY — using raw descriptions for new items.");
      needSummary.forEach((item) => { item.description = item.raw; });
    }
  } else {
    console.log("All items already summarised (cache hit).");
  }

  // Remove raw field from output
  const clean = items.map(({ raw: _raw, ...rest }) => rest);

  writeFileSync(OUT_PATH, JSON.stringify({ updated: new Date().toISOString(), sources: SOURCE_META, items: clean }, null, 2));
  console.log(`Done — wrote ${clean.length} items to news-data.json`);
}

main().catch((err) => { console.error(err); process.exit(1); });
