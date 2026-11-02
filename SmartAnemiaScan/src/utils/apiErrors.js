// Turns API failures into the app's message types (see "Messages & errors" in the design):
// a known API text maps to a field/banner message, no answer is a network problem,
// and anything else from a 5xx is a server problem.

// Server texts (Russian, from the backend) → message key. Matched by prefix, case-insensitive,
// because some of them are longer than shown here.
const API_TEXTS = [
  ['пожалуйста, укажите вашу почту', 'emailRequired'],
  ['неверный адрес электронной почты или пароль', 'wrongCredentials'],
  ['неверный адрес электронной почты', 'emailInvalid'],
  ['пароль должен содержать от 8 до 256 символов', 'passwordLength'],
  ['пароли не совпадают', 'passwordMismatch'],
  ['для регистрации нужно принять политику', 'policyRequired'],
  ['неверный код из письма', 'wrongCode'],
  ['the verification code entered is incorrect', 'wrongCode'],
  ['определить вероятность анемии не удалось', 'photoNotRead'],
  ['принята устаревшая версия политики', 'policyOutdated'],
  ['this email is already registered', 'emailTaken'],
  ['пользователь не найден', 'userNotFound'],
];

// Every human-readable text in an error body: { description }, { errors: { Field: [..] } }, { detail }, { message }
export const apiTexts = (error) => {
  // refreshTokenApi rethrows the body itself instead of the axios error; a plain Error has no body
  const data = error?.isAxiosError || error?.response || error instanceof Error ? error?.response?.data : error;
  if (!data || typeof data !== 'object') return [];
  const texts = [];
  if (data.description) texts.push(data.description);
  if (data.errors && typeof data.errors === 'object') {
    Object.values(data.errors).flat().forEach((t) => t && texts.push(String(t)));
  }
  if (data.detail) texts.push(data.detail);
  if (data.message) texts.push(data.message);
  return texts;
};

export const matchApiText = (text) => {
  const normalized = String(text || '').trim().toLowerCase();
  const hit = API_TEXTS.find(([prefix]) => normalized.startsWith(prefix));
  return hit ? hit[1] : null;
};

// All known message keys found in the error, in order
export const apiMessageKeys = (error) => {
  const keys = apiTexts(error).map(matchApiText).filter(Boolean);
  if (error?.response?.status === 409 && !keys.includes('emailTaken')) keys.push('emailTaken');
  return keys;
};

// 'network' — the server never answered; 'server' — 5xx without a known text; 'api' — anything else
export const errorKind = (error) => {
  if (error?.isAxiosError && !error.response) return 'network';
  if (error instanceof TypeError || error?.message === 'Network Error') return 'network';
  const status = error?.response?.status ?? error?.statusCode;
  if (status >= 500 && apiMessageKeys(error).length === 0) return 'server';
  return 'api';
};

export const isValidEmail = (value) => /^\S+@\S+\.\S+$/.test(String(value || '').trim());

export const MIN_PASSWORD = 8;

// Letters (Latin, Cyrillic incl. Kazakh), single spaces, hyphens and apostrophes between them:
// "Karim Abrakhmanov", "Әлия Нұрланқызы", "Anna-Maria O’Neil". No digits, dots, commas or emoji.
const NAME_LETTER = 'A-Za-z\u00C0-\u024F\u0400-\u04FF';
const NAME_RE = new RegExp(`^[${NAME_LETTER}]+(?:[ '’-][${NAME_LETTER}]+)*$`);
const MAX_NAME = 100;

// Trims and collapses repeated spaces — what gets sent to the server
export const cleanName = (value) => String(value || '').trim().replace(/\s+/g, ' ');

// Returns the error line for the field, or '' when the name is fine
export const validateFullName = (value) => {
  const name = cleanName(value);
  if (!name) return 'Enter your full name';
  if (name.length < 2) return 'Enter at least 2 letters';
  if (name.length > MAX_NAME) return `Keep it under ${MAX_NAME} characters`;
  if (!NAME_RE.test(name)) return 'Use letters only — spaces, hyphens and apostrophes are fine';
  return '';
};

// Short texts shown under a field or in a banner for each key
export const FIELD_TEXT = {
  emailRequired: 'Enter your email',
  emailInvalid: 'Enter a valid email, like name@gmail.com',
  passwordRequired: 'Enter your password',
  passwordLength: `At least ${MIN_PASSWORD} characters`,
  passwordMismatch: 'Passwords don’t match',
  policyRequired: 'Accept the Privacy Policy to continue',
};
