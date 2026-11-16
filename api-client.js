(() => {
  const configuredBaseUrl = document.querySelector('meta[name="race-api-base-url"]')?.content.trim();
  const isLocalhost = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
  const baseUrl = isLocalhost || !configuredBaseUrl ? window.location.origin : configuredBaseUrl;

  window.raceApiUrl = pathname => new URL(pathname, `${baseUrl.replace(/\/+$/, '')}/`).toString();
})();
