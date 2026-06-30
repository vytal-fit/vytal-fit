/**
 * Org-aware formatting. Reads the active organization's currency, timezone and
 * derived locale from `orgSettings.get` (profile blob) and returns bound
 * money/date formatters. This is the single place the admin UI should go for
 * "format this amount/date the way THIS org expects".
 *
 * Falls back to EUR / Europe/Lisbon / pt-PT while the query loads or when an
 * org has not configured its profile.
 */
import { trpc } from "@/lib/trpc";

const LOCALE_BY_CURRENCY: Record<string, string> = {
  EUR: "pt-PT",
  USD: "en-US",
  GBP: "en-GB",
  BRL: "pt-BR",
  CHF: "de-CH",
  MZN: "pt-MZ",
  MAD: "fr-MA",
  AOA: "pt-AO",
  CVE: "pt-CV",
};

export interface OrgFormat {
  currency: string;
  timezone: string;
  locale: string;
  /** Format a money amount in the org's currency/locale. */
  money: (amount: number) => string;
  /** Compact money (e.g. 15K) for chart axes. */
  moneyCompact: (amount: number) => string;
  /** Format a date in the org's timezone/locale (date only). */
  date: (value: string | Date, opts?: Intl.DateTimeFormatOptions) => string;
  /** Format a date + time in the org's timezone/locale. */
  dateTime: (value: string | Date) => string;
}

export function useOrgFormat(): OrgFormat {
  const settings = trpc.orgSettings.get.useQuery();
  const currency = settings.data?.profile.currency || "EUR";
  const timezone = settings.data?.profile.timezone || "Europe/Lisbon";
  const locale = LOCALE_BY_CURRENCY[currency] ?? "pt-PT";

  return {
    currency,
    timezone,
    locale,
    money: (amount: number) =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount),
    moneyCompact: (amount: number) =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        notation: "compact",
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      }).format(amount),
    date: (value, opts) =>
      new Intl.DateTimeFormat(locale, {
        timeZone: timezone,
        day: "2-digit",
        month: "short",
        year: "numeric",
        ...opts,
      }).format(new Date(value)),
    dateTime: (value) =>
      new Intl.DateTimeFormat(locale, {
        timeZone: timezone,
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(value)),
  };
}
