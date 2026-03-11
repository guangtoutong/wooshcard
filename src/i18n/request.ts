import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  // For now, default to 'en'. Later we'll read from user session/cookie.
  const locale = 'en';
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
