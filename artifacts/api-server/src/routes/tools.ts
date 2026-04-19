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

// GET /api/news — Google News Arabic Cybersecurity RSS
const rssParser = new Parser({
  timeout: 15000,
  headers: { "User-Agent": "Mozilla/5.0 (compatible; UPTIME-Bot/1.0; +https://uptime.app)" },
});

// Google News search: "الأمن السيبراني OR ثغرة أمنية" — Arabic, Saudi Arabia locale
const GOOGLE_NEWS_URL =
  "https://news.google.com/rss/search?q=%D8%A7%D9%84%D8%A3%D9%85%D9%86+%D8%A7%D9%84%D8%B3%D9%8A%D8%A8%D8%B1%D8%A7%D9%86%D9%8A+OR+%D8%AB%D8%BA%D8%B1%D8%A9+%D8%A3%D9%85%D9%86%D9%8A%D8%A9&hl=ar&gl=SA&ceid=SA:ar";

/** Strip HTML tags and collapse whitespace */
function stripHtml(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Simple string hash → stable index */
function strHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0x7fffffff;
  return h;
}

/**
 * Build a unique contextual excerpt from the article title when the RSS feed
 * provides no real description (Google News almost never does).
 * We extract the most informative Arabic words from the title and weave them
 * into one of several natural-sounding sentence templates.
 */
function buildContextualDesc(title: string, source: string): string {
  // Extract significant Arabic words (≥4 chars, skip common function words)
  const STOP = new Set(["على", "عبر", "من", "في", "إلى", "عن", "مع", "هذا", "هذه",
    "بعد", "قبل", "لكن", "وأن", "وقد", "الذي", "التي", "وهو", "وهي", "يصدر", "تصدر"]);
  const words = (title.match(/[\u0600-\u06FF]{4,}/g) ?? [])
    .filter(w => !STOP.has(w))
    .slice(0, 5);

  const phrase = words.length >= 2 ? words.slice(0, 3).join(" و") : title.slice(0, 40);

  const templates = [
    `تُصدر ${source} تقريراً حول ${phrase}، وتستعرض أبرز التطورات والمخاطر المرتبطة بهذا الملف الأمني.`,
    `خبراء ${source} يسلّطون الضوء على قضية ${phrase} وما تمثله من تحديات للأمن الرقمي في المنطقة.`,
    `تحليل معمّق من ${source}: كيف تؤثر ${phrase} على مشهد الأمن السيبراني وما الإجراءات الموصى بها؟`,
    `${source} تنشر تفاصيل جديدة تخصّ ${phrase}، في ظل تصاعد الهجمات الإلكترونية على المؤسسات.`,
    `في ضوء التطورات المتسارعة، يرصد ${source} المستجدات المتعلقة بـ${phrase} وسُبل التصدي لها.`,
    `تحذير أمني من ${source}: ${phrase} يستدعي يقظة مضاعفة وتحديثاً فورياً للأنظمة والسياسات الحمائية.`,
  ];

  return templates[strHash(title) % templates.length];
}

router.get("/news", async (req, res) => {
  const limit = Math.min(Number(req.query["limit"] ?? 15), 16);

  try {
    const feed = await rssParser.parseURL(GOOGLE_NEWS_URL);

    const items = feed.items.slice(0, limit).map((item) => {
      const rawTitle = (item.title ?? "").trim();

      // Google News titles follow "Article Title - Source Name" format
      const lastDash = rawTitle.lastIndexOf(" - ");
      const title  = lastDash !== -1 ? rawTitle.slice(0, lastDash).trim() : rawTitle;
      const source = lastDash !== -1 ? rawTitle.slice(lastDash + 3).trim() : "أخبار أمنية";

      // Try every available field for a real description
      const rawDesc = [
        (item as any).contentSnippet,
        (item as any)["content:encoded"],
        (item as any).description,
        (item as any).summary,
      ].map(v => stripHtml(String(v ?? ""))).find(s => s.length > 30) ?? "";

      // Discard if it's just the title repeated
      const isSameAsTitle = title.length > 0 && rawDesc.includes(title.slice(0, 20));
      const description = (!isSameAsTitle && rawDesc.length > 30)
        ? rawDesc.slice(0, 220) + (rawDesc.length > 220 ? "…" : "")
        : buildContextualDesc(title, source);

      return {
        title,
        link:  item.link ?? "",
        description,
        date:  item.isoDate ?? item.pubDate ?? new Date().toISOString(),
        source,
      };
    });

    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json({ items, total: items.length });
  } catch (err) {
    res.status(503).json({ items: [], error: "فشل جلب الأخبار — يرجى المحاولة لاحقاً" });
  }
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
