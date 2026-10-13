// Shared wording and formatting for a scan, used by the result screen, history and home.

export const formatScanDate = (iso, { withYear = false } = {}) => {
  const date = new Date(iso);
  const day = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', ...(withYear ? { year: 'numeric' } : {}) });
  const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return `${day} · ${time}`;
};

export const formatRelativeDay = (iso) => {
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOfDay(new Date()) - startOfDay(new Date(iso))) / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return 'a week ago';
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
};

// Blood-test dates are calendar dates ('YYYY-MM-DD'), not instants. Parse them as local dates:
// `new Date('2026-10-04')` is UTC midnight and shows the previous day west of Greenwich.
export const parseCalendarDate = (value) => {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const toCalendarDate = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export const formatCalendarDate = (value) =>
  parseCalendarDate(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export const percent = (fraction) => Math.round(fraction * 100);

// What the result means and what to do next, per risk level. No treatment advice:
// the most the app recommends is a blood test and a talk with a doctor.
export const riskCopy = {
  low: {
    meaning: 'The colour of your inner eyelid looks within the usual range. Weekly scans help you notice changes early.',
    next: 'Next scan in 7 days keeps your streak going',
    doctor: 'Feeling tired or dizzy often? Mention it to your doctor anyway',
  },
  moderate: {
    meaning: 'Some signs that can come with low haemoglobin. One photo is not enough to say for sure.',
    next: 'Consider a complete blood count (CBC) at a clinic',
  },
  high: {
    meaning: 'Your inner eyelid looks paler than usual, which is a common sign of anemia. Please get a blood test.',
    next: 'Book a complete blood count (CBC) soon and show this result to your doctor',
  },
};

// Used only when an older backend sends no disclaimer with the result
export const FALLBACK_DISCLAIMER =
  "This is a screening estimate, not a diagnosis. The app is not a medical device and doesn't replace a doctor's exam or a blood test.";
