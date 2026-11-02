// Catches mistyped emails before a code is sent to them.
// Whether the mailbox itself exists only the email code can prove; this checks that the domain
// can receive mail at all and suggests the popular domain the person probably meant.

const POPULAR_DOMAINS = [
  'gmail.com', 'mail.ru', 'yandex.ru', 'yandex.kz', 'ya.ru', 'inbox.ru', 'list.ru', 'bk.ru',
  'icloud.com', 'me.com', 'outlook.com', 'hotmail.com', 'live.com', 'yahoo.com', 'proton.me',
];

// Levenshtein distance, enough for short domain names
const distance = (a, b) => {
  const row = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i += 1) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const next = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = row[j];
      row[j] = next;
    }
  }
  return row[b.length];
};

// "karim@gmail.coa" → "karim@gmail.com"; null when nothing close enough
export const suggestEmail = (email) => {
  const [local, domain] = String(email || '').trim().toLowerCase().split('@');
  if (!local || !domain || POPULAR_DOMAINS.includes(domain)) return null;
  let best = null;
  POPULAR_DOMAINS.forEach((candidate) => {
    const d = distance(domain, candidate);
    if (d <= 2 && (!best || d < best.d)) best = { candidate, d };
  });
  return best ? `${local}@${best.candidate}` : null;
};

const DNS_URL = 'https://dns.google/resolve';
const TIMEOUT_MS = 4000;
const cache = {};

const lookup = async (name, recordType) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${DNS_URL}?name=${encodeURIComponent(name)}&type=${recordType}`, {
      signal: controller.signal,
      headers: { accept: 'application/dns-json' },
    });
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
};

// false only when DNS clearly says the domain can't take mail; any lookup problem counts as "fine"
// so a slow or blocked DNS service never stops a real sign-up
export const domainAcceptsMail = async (email) => {
  const domain = String(email || '').trim().toLowerCase().split('@')[1];
  if (!domain) return false;
  if (domain in cache) return cache[domain];
  try {
    const mx = await lookup(domain, 'MX');
    let ok;
    if (mx.Status === 3) ok = false; // NXDOMAIN — the domain doesn't exist
    else if (mx.Status !== 0) return true;
    else if (mx.Answer?.some((r) => r.type === 15)) ok = true;
    else {
      // No MX: mail still goes to the domain's own address if it has one
      const a = await lookup(domain, 'A');
      ok = a.Status === 0 && !!a.Answer?.some((r) => r.type === 1);
    }
    cache[domain] = ok;
    return ok;
  } catch {
    return true;
  }
};
