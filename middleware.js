/**
 * Vercel Edge Middleware — SEO meta tag injection for bots
 *
 * Social media crawlers (Telegram, WhatsApp, Discord, Facebook, Slack, etc.)
 * don't execute JavaScript, so they can't see React-rendered meta tags.
 * This middleware intercepts bot requests server-side and returns HTML with
 * fully-populated Open Graph meta tags — before the SPA ever loads.
 *
 * Supports:
 *  - Per-page SEO overrides from admin settings (pageSeo)
 *  - Blog post pages: fetches title + excerpt from /api/posts/:slug
 *  - Project pages: fetches title + description from /api/projects/:id
 *
 * Runs on the Vercel Edge (zero cold starts, global).
 */

const BOT_UA =
  /telegram|whatsapp|facebookexternalhit|twitterbot|discordbot|slackbot|linkedinbot|googlebot|bingbot|applebot|embedly|pinterest|vkShare|Iframely|W3C_Validator|MetaInspector|preview|crawler|spider/i;

/** Escape HTML special chars to prevent injection */
const esc = (str = '') =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

/** Map URL pathname → pageSeo key stored in DB settings */
const PATH_TO_KEY = {
  '/': 'home',
  '/about': 'about',
  '/skills': 'skills',
  '/experience': 'experience',
  '/projects': 'projects',
  '/education': 'education',
  '/certificates': 'certificates',
  '/contact': 'contact',
  '/blog': 'blog',
};

/** Built-in fallback descriptions — used when admin hasn't set one */
const PAGE_DEFAULTS = {
  home: 'Software engineer specializing in modern web technologies. Explore my portfolio.',
  about: 'Learn about my background, experience, and what drives me as a developer.',
  skills: 'Technical skills across frontend, backend, databases, and DevOps.',
  experience: 'Professional work experience and career history.',
  projects: 'Software projects built with modern technologies. See what I\'ve built.',
  education: 'Academic background and qualifications.',
  certificates: 'Professional certifications and credentials.',
  blog: 'Articles and thoughts on software engineering and development.',
  contact: 'Get in touch — open to new opportunities and collaborations.',
};

export const config = {
  matcher: [
    '/',
    '/about',
    '/skills',
    '/experience',
    '/projects',
    '/education',
    '/certificates',
    '/contact',
    '/blog',
    '/blog/:path*',
    '/projects/:path*',
  ],
};

export default async function middleware(request) {
  const ua = request.headers.get('user-agent') || '';

  // Real users → pass through to the React SPA unchanged
  if (!BOT_UA.test(ua)) return;

  const apiBase = process.env.API_URL || process.env.VITE_API_URL || '';
  const { pathname } = new URL(request.url);

  const pageKey = PATH_TO_KEY[pathname] ?? null;

  // ── Defaults ───────────────────────────────────────────────────────────────
  let siteTitle = 'Tim Bin – Software Engineer';
  let siteDesc = PAGE_DEFAULTS[pageKey] || 'Software engineer portfolio.';
  let keywords = '';
  let ogImage = '';
  let pageTitle = ''; // page-specific title (overrides siteTitle prefix)
  let pageDesc = ''; // page-specific description

  if (apiBase) {
    try {
      // ── 1. Fetch global + per-page settings ────────────────────────────────
      const settingsRes = await fetch(`${apiBase}/settings/public`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(3000),
      });

      if (settingsRes.ok) {
        const json = await settingsRes.json();
        const s = json?.data ?? {};

        if (s.siteTitle) siteTitle = s.siteTitle;
        if (s.seoDescription) siteDesc = s.seoDescription;
        if (s.seoKeywords) keywords = s.seoKeywords;
        if (s.ogImage) ogImage = s.ogImage;

        // Admin-configured per-page override
        // Skip title override if it's identical to the site title (avoids "Title | Title" doubling)
        if (pageKey && s.pageSeo?.[pageKey]) {
          const pg = s.pageSeo[pageKey];
          const pgTitle = pg.title?.trim();
          if (pgTitle && pgTitle !== siteTitle) pageTitle = pgTitle;
          if (pg.description?.trim()) pageDesc = pg.description.trim();
        }
      }

      // If no ogImage yet, try to use the profile photo as fallback
      if (!ogImage) {
        const profileRes = await fetch(`${apiBase}/profile`, {
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(2000),
        });
        if (profileRes.ok) {
          const pj = await profileRes.json();
          const profile = pj?.data ?? pj;
          if (profile?.avatar) ogImage = profile.avatar;
        }
      }

      // ── 2. Blog post — /blog/:slug ─────────────────────────────────────────
      const blogMatch = pathname.match(/^\/blog\/([^/]+)$/);
      if (blogMatch) {
        const slug = blogMatch[1];
        const postRes = await fetch(`${apiBase}/posts/${slug}`, {
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(3000),
        });
        if (postRes.ok) {
          const pj = await postRes.json();
          const post = pj?.data ?? pj;
          if (post?.title) pageTitle = post.title;
          if (post?.excerpt) pageDesc = post.excerpt;
          if (post?.coverImage) ogImage = post.coverImage;
        }
      }

      // ── 3. Project detail — /projects/:id ──────────────────────────────────
      const projectMatch = pathname.match(/^\/projects\/([^/]+)$/);
      if (projectMatch) {
        const id = projectMatch[1];
        const projRes = await fetch(`${apiBase}/projects/${id}`, {
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(3000),
        });
        if (projRes.ok) {
          const pj = await projRes.json();
          const proj = pj?.data ?? pj;
          if (proj?.title) pageTitle = proj.title;
          if (proj?.description) pageDesc = String(proj.description).slice(0, 200);
          if (proj?.images?.[0]) ogImage = proj.images[0];
        }
      }
    } catch {
      // Timeout / network error — fall through to defaults, still serve meta HTML
    }
  }

  // ── Resolve final title & description ─────────────────────────────────────
  // For the home page: use just siteTitle so it doesn't double-up with og:site_name
  // For other pages: prepend the page name (e.g. "Education | Tim Bin – Software Engineer")
  // For dynamic pages with a fetched title (blog/project): prepend that title
  const resolvedTitle = pageTitle
    ? `${pageTitle} | ${siteTitle}`
    : (pageKey && pageKey !== 'home')
      ? `${pageKey.charAt(0).toUpperCase() + pageKey.slice(1)} | ${siteTitle}`
      : siteTitle;

  const resolvedDesc = pageDesc
    || (pageKey ? PAGE_DEFAULTS[pageKey] : '')
    || siteDesc;

  const ogType = pathname.startsWith('/blog/') ? 'article' : 'website';

  return new Response(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>${esc(resolvedTitle)}</title>
  <meta name="description" content="${esc(resolvedDesc)}" />
  ${keywords ? `<meta name="keywords" content="${esc(keywords)}" />` : ''}

  <!-- Open Graph -->
  <meta property="og:type"        content="${esc(ogType)}" />
  <meta property="og:url"         content="${esc(request.url)}" />
  <meta property="og:title"       content="${esc(resolvedTitle)}" />
  <meta property="og:description" content="${esc(resolvedDesc)}" />
  ${ogImage ? `<meta property="og:image" content="${esc(ogImage)}" />` : ''}
  <meta property="og:site_name"   content="${esc(siteTitle)}" />

  <!-- Twitter / X Card -->
  <meta name="twitter:card"        content="summary_large_image" />
  <meta name="twitter:title"       content="${esc(resolvedTitle)}" />
  <meta name="twitter:description" content="${esc(resolvedDesc)}" />
  ${ogImage ? `<meta name="twitter:image" content="${esc(ogImage)}" />` : ''}
</head>
<body>
  <!-- Bot-only response — real users receive the full React SPA via the rewrite rule -->
</body>
</html>`,
    {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        // Cache 5 min; bots share the cached version while users get fresh SPA
        'cache-control': 'public, max-age=300, stale-while-revalidate=60',
      },
    },
  );
}
