// Locale-detection redirect shell. Rendered at `/` when the user hasn't been
// routed to a locale yet. Static-export-safe: no headers/cookies, no layout
// above it, ships a meta-refresh fallback plus a navigator.language script
// that forwards Spanish browsers to /es/ and everyone else to /en/.
export default function RootPage() {
  const script = `
    (function() {
      try {
        var lang = (navigator.language || 'en').slice(0, 2);
        var target = lang === 'es' ? '/es/' : '/en/';
        location.replace(target);
      } catch (e) {
        location.replace('/en/');
      }
    })();
  `;

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="refresh" content="0; url=/en/" />
        <link rel="canonical" href="https://longevity.mbdev.to/en/" />
        <title>Longevity Wiki</title>
        <script dangerouslySetInnerHTML={{ __html: script }} />
      </head>
      <body>
        <noscript>
          <a href="/en/">Continue to Longevity Wiki</a>
        </noscript>
      </body>
    </html>
  );
}
