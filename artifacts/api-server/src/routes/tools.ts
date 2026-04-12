import { Router } from "express";
import { z } from "zod/v4";
import * as https from "https";
import * as net from "net";
import * as dns from "dns";
import { promisify } from "util";
import Parser from "rss-parser";

const router = Router();

const resolveMx = promisify(dns.resolveMx);
const resolveTxt = promisify(dns.resolveTxt);
const resolve4 = promisify(dns.resolve4);

function isPrivateIP(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts[0] === 10) return true;
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  if (parts[0] === 192 && parts[1] === 168) return true;
  if (parts[0] === 127) return true;
  if (ip === "::1" || ip === "localhost") return true;
  return false;
}

function fetchJson(url: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith("https://");
    const httpModule = isHttps ? https : require("http");
    const req = httpModule.get(url, { timeout: 10000 }, (res: any) => {
      let data = "";
      res.on("data", (chunk: any) => { data += chunk; });
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error("Invalid JSON response"));
        }
      });
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("Request timeout")); });
  });
}

function fetchText(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : require("http");
    const req = protocol.get(url, { timeout: 15000 }, (res: any) => {
      let data = "";
      res.on("data", (chunk: any) => { data += chunk; });
      res.on("end", () => resolve(data));
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("Request timeout")); });
  });
}

function checkPort(host: string, port: number): Promise<{ open: boolean; latencyMs: number }> {
  return new Promise((resolve) => {
    const start = Date.now();
    const socket = new net.Socket();
    socket.setTimeout(3000);
    socket.on("connect", () => {
      const latencyMs = Date.now() - start;
      socket.destroy();
      resolve({ open: true, latencyMs });
    });
    socket.on("timeout", () => {
      socket.destroy();
      resolve({ open: false, latencyMs: 3000 });
    });
    socket.on("error", () => {
      const latencyMs = Date.now() - start;
      socket.destroy();
      resolve({ open: false, latencyMs });
    });
    socket.connect(port, host);
  });
}

// GET /api/tools/geoip
router.get("/tools/geoip", async (req, res) => {
  const targetRaw = req.query["target"];
  if (!targetRaw || typeof targetRaw !== "string") {
    res.status(400).json({ error: "target parameter is required" });
    return;
  }
  const target = targetRaw.trim();

  try {
    if (isPrivateIP(target)) {
      res.json({
        ip: target,
        query: target,
        isPrivate: true,
        country: "شبكة داخلية",
        city: "N/A",
        region: "N/A",
        isp: "N/A",
        org: "N/A",
        timezone: "N/A",
        lat: 0,
        lon: 0,
      });
      return;
    }

    const data = await fetchJson(`http://ip-api.com/json/${encodeURIComponent(target)}?fields=status,message,country,countryCode,region,city,lat,lon,isp,org,timezone,query`) as any;

    if (data.status === "fail") {
      res.status(400).json({ error: data.message || "Failed to lookup IP/domain" });
      return;
    }

    res.json({
      ip: data.query || target,
      query: target,
      isPrivate: false,
      country: data.country || "غير معروف",
      countryCode: data.countryCode,
      region: data.region,
      city: data.city || "غير معروف",
      lat: data.lat,
      lon: data.lon,
      isp: data.isp,
      org: data.org,
      timezone: data.timezone,
    });
  } catch (err: any) {
    req.log.error({ err }, "GeoIP lookup failed");
    res.status(400).json({ error: err.message || "Lookup failed" });
  }
});

// GET /api/tools/dns
router.get("/tools/dns", async (req, res) => {
  const domain = req.query["domain"];
  if (!domain || typeof domain !== "string") {
    res.status(400).json({ error: "domain parameter is required" });
    return;
  }
  const d = domain.trim();

  try {
    const records: Array<{ type: string; value: string; ttl?: number }> = [];

    try {
      const aRecords = await resolve4(d);
      for (const ip of aRecords) {
        records.push({ type: "A", value: ip });
      }
    } catch {}

    try {
      const mxRecords = await resolveMx(d);
      for (const mx of mxRecords) {
        records.push({ type: "MX", value: `${mx.priority} ${mx.exchange}` });
      }
    } catch {}

    try {
      const txtRecords = await resolveTxt(d);
      for (const txt of txtRecords) {
        records.push({ type: "TXT", value: txt.join(" ") });
      }
    } catch {}

    res.json({ domain: d, records });
  } catch (err: any) {
    req.log.error({ err }, "DNS lookup failed");
    res.status(400).json({ error: err.message || "DNS lookup failed" });
  }
});

// GET /api/tools/mac
router.get("/tools/mac", async (req, res) => {
  const mac = req.query["mac"];
  if (!mac || typeof mac !== "string") {
    res.status(400).json({ error: "mac parameter is required" });
    return;
  }
  const macClean = mac.trim().toUpperCase().replace(/[^A-F0-9]/g, "").slice(0, 6);

  if (macClean.length < 6) {
    res.status(400).json({ error: "Invalid MAC address format" });
    return;
  }

  // Format OUI as XX:XX:XX for the API
  const oui = macClean.match(/.{1,2}/g)?.join(":") || macClean;

  try {
    // macvendors.com returns plain text, not JSON — use fetchText
    const vendor = await fetchText(`https://api.macvendors.com/${oui}`) as string;
    const vendorTrimmed = (vendor ?? "").trim();
    if (vendorTrimmed && !vendorTrimmed.startsWith("{") && vendorTrimmed.length > 1) {
      res.json({ mac: mac.trim(), vendor: vendorTrimmed, found: true });
    } else {
      res.json({ mac: mac.trim(), vendor: null, found: false });
    }
  } catch (err: any) {
    res.json({ mac: mac.trim(), vendor: null, found: false });
  }
});

// GET /api/tools/portscan
router.get("/tools/portscan", async (req, res) => {
  const host = req.query["host"];
  if (!host || typeof host !== "string") {
    res.status(400).json({ error: "host parameter is required" });
    return;
  }
  const h = host.trim();

  const portsToScan = [
    { port: 80, service: "HTTP" },
    { port: 443, service: "HTTPS" },
    { port: 22, service: "SSH" },
    { port: 21, service: "FTP" },
  ];

  try {
    const results = await Promise.all(
      portsToScan.map(async ({ port, service }) => {
        const { open, latencyMs } = await checkPort(h, port);
        return { port, service, open, latencyMs };
      })
    );

    res.json({
      host: h,
      ports: results,
      scannedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    req.log.error({ err }, "Port scan failed");
    res.status(400).json({ error: err.message || "Port scan failed" });
  }
});

// GET /api/tools/whois
router.get("/tools/whois", async (req, res) => {
  const domain = req.query["domain"];
  if (!domain || typeof domain !== "string") {
    res.status(400).json({ error: "domain parameter is required" });
    return;
  }
  const d = domain.trim().toLowerCase();

  try {
    const data = await fetchJson(`https://rdap.org/domain/${encodeURIComponent(d)}`) as any;

    const nameservers: string[] = [];
    if (data.nameservers) {
      for (const ns of data.nameservers) {
        nameservers.push(ns.ldhName || ns.ldh || "");
      }
    }

    let createdDate = "";
    let expiryDate = "";
    let updatedDate = "";
    if (data.events) {
      for (const event of data.events) {
        if (event.eventAction === "registration") createdDate = event.eventDate;
        if (event.eventAction === "expiration") expiryDate = event.eventDate;
        if (event.eventAction === "last changed") updatedDate = event.eventDate;
      }
    }

    let registrar = "";
    if (data.entities) {
      for (const entity of data.entities) {
        if (entity.roles?.includes("registrar")) {
          registrar = entity.vcardArray?.[1]?.find((v: any) => v[0] === "fn")?.[3] || entity.handle || "";
          break;
        }
      }
    }

    const status = Array.isArray(data.status) ? data.status.join(", ") : (data.status || "");

    res.json({
      domain: d,
      registrar: registrar || "غير محدد",
      createdDate,
      expiryDate,
      updatedDate,
      status,
      nameservers,
      registrant: "",
      rawData: JSON.stringify(data, null, 2).slice(0, 2000),
    });
  } catch (err: any) {
    req.log.error({ err }, "WHOIS lookup failed");
    res.status(400).json({ error: "فشل في جلب بيانات النطاق - قد يكون غير مدعوم" });
  }
});

// GET /api/tools/ssl
router.get("/tools/ssl", async (req, res) => {
  const domain = req.query["domain"];
  if (!domain || typeof domain !== "string") {
    res.status(400).json({ error: "domain parameter is required" });
    return;
  }
  const d = domain.trim().replace(/^https?:\/\//, "").split("/")[0];

  try {
    const data = await fetchJson(`https://api.ssllabs.com/api/v3/analyze?host=${encodeURIComponent(d)}&startNew=on&all=done&ignoreMismatch=on`) as any;

    if (data.status === "ERROR" || !data.endpoints?.length) {
      // Fallback: try a simple TLS check
      const certInfo = await new Promise<any>((resolve, reject) => {
        const socket = require("tls").connect(443, d, { servername: d, timeout: 10000 }, () => {
          const cert = socket.getPeerCertificate();
          const protocol = socket.getProtocol();
          socket.destroy();
          resolve({ cert, protocol });
        });
        socket.on("error", reject);
        socket.on("timeout", () => { socket.destroy(); reject(new Error("Connection timeout")); });
      });

      const cert = certInfo.cert;
      const validTo = cert.valid_to ? new Date(cert.valid_to) : null;
      const validFrom = cert.valid_from ? new Date(cert.valid_from) : null;
      const now = new Date();
      const daysRemaining = validTo ? Math.floor((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : -1;
      const expired = daysRemaining < 0;
      const selfSigned = cert.issuer?.O === cert.subject?.O && cert.issuer?.CN === cert.subject?.CN;

      res.json({
        domain: d,
        valid: !expired,
        issuer: cert.issuer ? `${cert.issuer.O || ""} ${cert.issuer.CN || ""}`.trim() : "غير معروف",
        subject: cert.subject?.CN || d,
        validFrom: validFrom?.toISOString() || "",
        validTo: validTo?.toISOString() || "",
        daysRemaining: Math.max(0, daysRemaining),
        protocol: certInfo.protocol || "TLS",
        selfSigned: selfSigned || false,
        expired,
      });
      return;
    }

    const endpoint = data.endpoints[0];
    const certDetails = endpoint?.details?.cert || {};
    const validTo = certDetails.notAfter ? new Date(certDetails.notAfter) : null;
    const validFrom = certDetails.notBefore ? new Date(certDetails.notBefore) : null;
    const now = new Date();
    const daysRemaining = validTo ? Math.floor((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : -1;

    res.json({
      domain: d,
      valid: endpoint?.grade !== "F" && daysRemaining > 0,
      issuer: certDetails.issuerLabel || "غير معروف",
      subject: certDetails.subject || d,
      validFrom: validFrom?.toISOString() || "",
      validTo: validTo?.toISOString() || "",
      daysRemaining: Math.max(0, daysRemaining),
      protocol: endpoint?.details?.protocols?.[0]?.name || "TLS",
      selfSigned: false,
      expired: daysRemaining < 0,
    });
  } catch (err: any) {
    // Final fallback: basic TLS connection
    try {
      const tls = await import("tls");
      const certInfo = await new Promise<any>((resolve, reject) => {
        const socket = tls.connect(443, d, { servername: d, timeout: 10000 }, () => {
          const cert = socket.getPeerCertificate();
          const protocol = socket.getProtocol();
          socket.destroy();
          resolve({ cert, protocol });
        });
        socket.on("error", reject);
        socket.on("timeout", () => { socket.destroy(); reject(new Error("timeout")); });
      });

      const cert = certInfo.cert;
      const validTo = cert.valid_to ? new Date(cert.valid_to) : null;
      const now = new Date();
      const daysRemaining = validTo ? Math.floor((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : -1;
      const expired = daysRemaining < 0;
      const selfSigned = cert.issuer?.O === cert.subject?.O && cert.issuer?.CN === cert.subject?.CN;

      res.json({
        domain: d,
        valid: !expired,
        issuer: cert.issuer ? `${cert.issuer.O || ""} ${cert.issuer.CN || ""}`.trim() : "غير معروف",
        subject: cert.subject?.CN || d,
        validFrom: cert.valid_from ? new Date(cert.valid_from).toISOString() : "",
        validTo: validTo?.toISOString() || "",
        daysRemaining: Math.max(0, daysRemaining),
        protocol: certInfo.protocol || "TLS",
        selfSigned: selfSigned || false,
        expired,
      });
    } catch (finalErr: any) {
      req.log.error({ err: finalErr }, "SSL check failed");
      res.status(400).json({ error: "فشل في فحص شهادة SSL - تأكد من صحة النطاق" });
    }
  }
});

// GET /api/tools/urlsafety
router.get("/tools/urlsafety", async (req, res) => {
  const url = req.query["url"];
  if (!url || typeof url !== "string") {
    res.status(400).json({ error: "url parameter is required" });
    return;
  }
  const u = url.trim();

  try {
    // Use Google Safe Browsing public API (no key required for basic check)
    // Fallback: basic heuristic analysis
    const threats: string[] = [];
    const categories: string[] = [];
    let score = 100;

    // Heuristic checks
    const urlLower = u.toLowerCase();

    // Check for suspicious patterns
    if (urlLower.includes("phish") || urlLower.includes("malware") || urlLower.includes("virus")) {
      threats.push("محتوى مشبوه في الرابط");
      score -= 40;
    }
    if (urlLower.includes("bit.ly") || urlLower.includes("tinyurl") || urlLower.includes("t.co") || urlLower.includes("goo.gl")) {
      categories.push("رابط مختصر");
      score -= 10;
    }
    if (urlLower.includes("login") && (urlLower.includes("paypal") || urlLower.includes("bank") || urlLower.includes("secure"))) {
      threats.push("محاولة تصيد احتيالي محتملة");
      score -= 30;
    }
    if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(u) && !urlLower.startsWith("http://localhost")) {
      threats.push("رابط يستخدم عنوان IP مباشر");
      score -= 20;
    }
    if ((u.match(/\./g) || []).length > 4) {
      threats.push("نطاق فرعي مشبوه");
      score -= 15;
    }
    if (!urlLower.startsWith("https://")) {
      categories.push("اتصال غير مشفر (HTTP)");
      score -= 10;
    }
    if (urlLower.includes(".exe") || urlLower.includes(".bat") || urlLower.includes(".ps1") || urlLower.includes(".cmd")) {
      threats.push("رابط لملف تنفيذي");
      score -= 50;
    }

    // Try to fetch the URL head to check redirects
    try {
      const urlObj = new URL(u);
      const data = await fetchJson(`https://urlhaus-api.abuse.ch/v1/url/`) as any;
      if (data) {
        categories.push("تم فحصه من قاعدة بيانات URLhaus");
      }
    } catch {}

    score = Math.max(0, Math.min(100, score));
    const safe = score >= 60 && threats.length === 0;

    res.json({
      url: u,
      safe,
      score,
      threats,
      categories,
      checked: true,
    });
  } catch (err: any) {
    req.log.error({ err }, "URL safety check failed");
    res.status(400).json({ error: err.message || "URL safety check failed" });
  }
});

// GET /api/news — Arabic Cybersecurity RSS news feed
const rssParser = new Parser({
  timeout: 10000,
  headers: { "User-Agent": "Mozilla/5.0 (compatible; UPTIME-Bot/1.0)" },
  customFields: { item: [["content:encoded", "contentEncoded"]] },
});

// Sources — main feeds; security items are filtered by keyword below
const RSS_SOURCES = [
  { url: "https://aitnews.com/feed/",           name: "البوابة التقنية" },
  { url: "https://www.tech-wd.com/wd/feed/",   name: "عالم التقنية"   },
];

// Highly specific cybersecurity terms — matched in TITLE only
const TITLE_SECURITY_KEYWORDS = [
  "ثغر", "اختراق", "هجوم إلكتروني", "هجوم سيبراني", "هجمات إلكترونية",
  "برمجيات خبيثة", "برنامج خبيث", "قرصنة", "تسريب", "تجسس",
  "هاكر", "فيروس", "رانسوم", "مخترق", "ابتزاز إلكتروني",
  "كلمة مرور", "ضعف أمني", "اختراق إلكتروني", "مجموعة قراصنة",
  "تهديد إلكتروني", "تشفير", "خصوصية", "حماية البيانات",
  "أمن المعلومات", "أمن سيبراني", "أمن الشبكات", "جدار الحماية",
  "malware", "ransomware", "vulnerability", "CVE", "exploit",
  "breach", "phishing", "zero-day", "cyberattack", "spyware",
  "cybersecurity", "cyber security", "encryption", "firewall",
  "trojan", "backdoor", "botnet", "ddos", "rootkit",
];

function isSecurityRelated(title: string): boolean {
  const titleLc = title.toLowerCase();
  return TITLE_SECURITY_KEYWORDS.some((kw) => titleLc.includes(kw.toLowerCase()));
}

/**
 * Clean promotional boilerplate from RSS descriptions:
 * - "The post X appeared first on Y."
 * - "المقالة X ظهرت أولاً على Y."
 * - Trailing English-only sentences
 */
function cleanDescription(raw: string): string {
  return raw
    // "The post … appeared first on …."
    .replace(/The post .+? appeared first on .+?\./gi, "")
    // "This article … first appeared on …."
    .replace(/This article .+? first appeared on .+?\./gi, "")
    // Arabic equivalent patterns
    .replace(/المقال[ةه]? .+? ظهر.+? على .+?\./gi, "")
    .replace(/تم نشر .+? على .+?\./gi, "")
    // Remove leftover HTML entities and tags
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z]+;/gi, " ")
    // Collapse whitespace
    .replace(/\s{2,}/g, " ")
    .trim();
}

router.get("/news", async (req, res) => {
  const limit = Math.min(Number(req.query["limit"] ?? 6), 12);
  const rawItems: any[] = [];

  // 1. Fetch all RSS feeds in parallel; individual failures are silently skipped
  await Promise.allSettled(
    RSS_SOURCES.map(async ({ url, name }) => {
      const feed = await rssParser.parseURL(url);
      // Scan up to 20 items per source to get enough after filtering
      for (const item of feed.items.slice(0, 20)) {
        const rawDesc =
          item.contentSnippet ?? item.summary ?? item.content ?? "";
        const cleaned = cleanDescription(rawDesc);
        const title   = (item.title ?? "").trim();

        // 2. Keep only cybersecurity-related items (title-only check = no false positives)
        if (!isSecurityRelated(title)) continue;

        const description = cleaned.slice(0, 220).trim();
        rawItems.push({
          title,
          link:        item.link ?? "",
          description: description ? description + "…" : "",
          date:        item.isoDate ?? item.pubDate ?? new Date().toISOString(),
          source:      name,
        });
      }
    })
  );

  // 3. Sort descending by date (newest first)
  rawItems.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  res.json({ items: rawItems.slice(0, limit), total: rawItems.length });
});

// GET /api/tools/ping
router.get("/tools/ping", async (req, res) => {
  const host = req.query["host"];
  if (!host || typeof host !== "string") {
    res.status(400).json({ error: "host parameter is required" });
    return;
  }
  const h = host.trim().replace(/^https?:\/\//, "").split("/")[0];

  const ports = [80, 443, 22];
  let result = { open: false, latencyMs: 0 };

  for (const port of ports) {
    const r = await checkPort(h, port);
    if (r.open) {
      result = r;
      break;
    }
  }

  if (!result.open) {
    result = await checkPort(h, 443);
  }

  res.json({ host: h, open: result.open, latencyMs: result.open ? result.latencyMs : null });
});

export default router;
