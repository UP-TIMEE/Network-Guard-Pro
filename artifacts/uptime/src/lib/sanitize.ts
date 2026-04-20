const DANGEROUS = /<[^>]*>|javascript:|data:|vbscript:|on\w+\s*=/gi;
const CONTROL    = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

export function sanitizeInput(value: string): string {
  return value
    .replace(DANGEROUS, "")
    .replace(CONTROL, "")
    .trim()
    .slice(0, 512);
}

export function sanitizeDomain(value: string): string {
  return sanitizeInput(value)
    .replace(/[^a-zA-Z0-9.\-_:@[\]]/g, "")
    .toLowerCase();
}

export function sanitizeMac(value: string): string {
  return sanitizeInput(value).replace(/[^a-fA-F0-9:\-]/g, "");
}
