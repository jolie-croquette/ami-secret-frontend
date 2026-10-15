import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { localizePath, stripLang } from '@/i18n/lang';

const SITE = 'https://amisecret.xyz';

/** Pages publiques indexables : elles ont leur propre titre et leurs alternatives FR/EN. */
const PUBLIC_PAGES = { '/': 'home', '/login': 'login', '/terms': 'terms', '/privacy': 'privacy' } as const;
type PublicPath = keyof typeof PUBLIC_PAGES;

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setLink(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector<HTMLLinkElement>(selector);
  if (!el) {
    el = document.createElement('link');
    document.head.appendChild(el);
  }
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
}

/**
 * Met à jour le `<head>` selon la page et la langue : titre, description,
 * Open Graph / Twitter, URL canonique et liens `hreflang` FR / EN.
 * Monté une seule fois dans le Layout.
 */
export default function Seo() {
  const { t, i18n } = useTranslation('seo');
  const { pathname } = useLocation();
  const bare = stripLang(pathname);
  const page = bare in PUBLIC_PAGES ? PUBLIC_PAGES[bare as PublicPath] : null;
  const lang = i18n.language === 'en' ? 'en' : 'fr';

  useEffect(() => {
    if (!page) {
      document.title = t('app.title');
      return;
    }

    const title = t(`${page}.title`);
    const description = t(`${page}.description`);
    const ogTitle = page === 'home' ? t('home.ogTitle') : title;
    const ogDescription = page === 'home' ? t('home.ogDescription') : description;
    const url = `${SITE}${localizePath(bare, lang)}`;

    document.title = title;
    setMeta('name', 'description', description);
    setMeta('property', 'og:title', ogTitle);
    setMeta('property', 'og:description', ogDescription);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:locale', t('ogLocale'));
    setMeta('property', 'og:image:alt', t('ogImageAlt'));
    setMeta('name', 'twitter:title', ogTitle);
    setMeta('name', 'twitter:description', ogDescription);
    setLink('link[rel="canonical"]', { rel: 'canonical', href: url });
    setLink('link[rel="alternate"][hreflang="fr"]', {
      rel: 'alternate',
      hreflang: 'fr',
      href: `${SITE}${localizePath(bare, 'fr')}`,
    });
    setLink('link[rel="alternate"][hreflang="en"]', {
      rel: 'alternate',
      hreflang: 'en',
      href: `${SITE}${localizePath(bare, 'en')}`,
    });
    setLink('link[rel="alternate"][hreflang="x-default"]', {
      rel: 'alternate',
      hreflang: 'x-default',
      href: `${SITE}${localizePath(bare, 'fr')}`,
    });
  }, [page, bare, lang, t]);

  return null;
}
