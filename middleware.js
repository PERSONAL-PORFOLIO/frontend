/**
 * Vercel Edge Middleware — SEO meta tag injection for bots
 *
 * Social media crawlers (Telegram, WhatsApp, Discord, Facebook, etc.)
 * don't execute JavaScript, so they can't see React-rendered meta tags.
 * This middleware intercepts bot requests server-side, fetches the latest
 * settings from the backend API, and returns HTML with meta tags already
 * injected — before the SPA ever loads.
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

export const config = {
  // Run on every public route so per-page OG tags work in the future
  matcher: ['/', '/about', '/skills', '/experience', '/projects', '/education', '/certificates', '/contact'],
};

export default async function middleware(request) {
  const ua = request.headers.get('user-agent') || '';

  // Real users → pass through to the SPA unchanged
  if (!BOT_UA.test(ua)) return;

  // ── Fetch settings from backend ──────────────────────────────────────
  // Set API_URL in your Vercel project environment variables:
  //   API_URL = https://your-backend.onrender.com/api
  const apiBase = process.env.VITE_API_URL || '';

  let title = 'Tim Bin – Software Enginneer';
  let description = '';
  let keywords = '';
  let ogImage = '';

  if (apiBase) {
    try {
      const res = await fetch(`${apiBase}/settings/public`, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(3000), // 3 s max — don't block bots
      });
      if (res.ok) {
        const json = await res.json();
        const s = json?.data || {};
        if (s.siteTitle) title = s.siteTitle;
        if (s.seoDescription) description = s.seoDescription;
        if (s.seoKeywords) keywords = s.seoKeywords;
        if (s.ogImage) ogImage = s.ogImage;
      }
    } catch {
      // timeout or network error — fall back to defaults, still serve meta HTML
    }
  }

  const url = request.url;

  return new Response(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  ${keywords ? `<meta name="keywords" content="${esc(keywords)}" />` : ''}

  <!-- Open Graph -->
  <meta property="og:type"        content="website" />
  <meta property="og:url"         content="${esc(url)}" />
  <meta property="og:title"       content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  ${ogImage ? `<meta property="og:image" content="${esc(ogImage)}" />` : ''}

  <!-- Twitter / X Card -->
  <meta name="twitter:card"        content="summary_large_image" />
  <meta name="twitter:title"       content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  ${ogImage ? `<meta name="twitter:image" content="${esc(ogImage)}" />` : ''}
</head>
<body>
  <!-- Bot response — real users receive the full React SPA -->
</body>
</html>`,
    {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=300, stale-while-revalidate=60',
      },
    },
  );
}
