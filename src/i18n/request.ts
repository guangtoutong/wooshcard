import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

const SUPPORTED_LOCALES = ['en', 'zh'];

function getLocaleFromAcceptLanguage(acceptLanguage: string): string {
  const languages = acceptLanguage
    .split(',')
    .map((part) => {
      const [lang, q] = part.trim().split(';q=');
      return { lang: lang.trim().toLowerCase(), q: q ? parseFloat(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { lang } of languages) {
    const prefix = lang.split('-')[0];
    if (SUPPORTED_LOCALES.includes(prefix)) {
      return prefix;
    }
  }

  return 'en';
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headerStore = await headers();

  let locale = cookieStore.get('NEXT_LOCALE')?.value;

  if (!locale || !SUPPORTED_LOCALES.includes(locale)) {
    const acceptLanguage = headerStore.get('accept-language') || '';
    locale = getLocaleFromAcceptLanguage(acceptLanguage);
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
