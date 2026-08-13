import { Linking } from 'react-native';

/**
 * The handful of things this app does outside itself.
 *
 * These were the app's largest cluster of dead controls — WhatsApp, Call,
 * Share and Visit were all rendered as live buttons with no handler at all.
 * None of them needs a backend or a new dependency: they are `tel:` and
 * `https://wa.me` links, so they are wired for real rather than documented as
 * permanent gaps.
 *
 * There is deliberately no `copyText` here. A cross-platform clipboard needs
 * `expo-clipboard`, which this project's dependency tree will not currently
 * resolve, and a "Copy link" button that silently copies nothing on Android is
 * exactly the class of control this pass is removing — so the copy actions
 * share the link instead, which every seller here does with it anyway.
 *
 * Every call swallows its own failure. A phone with no dialler, or a browser
 * that refuses a popup, should do nothing — never crash the screen the seller is
 * standing in.
 */

/** Sri Lankan local numbers (`077 412 8890`) as WhatsApp wants them: `94774128890`. */
function toInternational(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('94')) return digits;
  return `94${digits.replace(/^0/, '')}`;
}

export function openUrl(url: string): void {
  Linking.openURL(url).catch(() => {
    /* No handler for this scheme — nothing useful to say about it. */
  });
}

/** Opens a WhatsApp chat, optionally pre-filled with a message. */
export function openWhatsApp(phone: string, message?: string): void {
  const query = message ? `?text=${encodeURIComponent(message)}` : '';
  openUrl(`https://wa.me/${toInternational(phone)}${query}`);
}

/** Hands a message to WhatsApp without naming a recipient — the seller picks. */
export function shareOnWhatsApp(message: string): void {
  openUrl(`https://wa.me/?text=${encodeURIComponent(message)}`);
}

export function callNumber(phone: string): void {
  openUrl(`tel:${phone.replace(/\s/g, '')}`);
}
