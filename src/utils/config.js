/* Task 38: App Configuration */
const ENV = import.meta.env || {};

export const config = Object.freeze({
  app: {
    name: 'LifeGex',
    version: '2.0.0',
    tagline: 'For Better Human Experiences',
    domain: 'lifegex.com',
  },
  features: {
    darkMode: true,
    smoothScroll: !matchMedia('(prefers-reduced-motion: reduce)').matches,
    cursorFX: !matchMedia('(prefers-reduced-motion: reduce)').matches
      && !matchMedia('(pointer: coarse)').matches,
    sparkleTrail: !matchMedia('(prefers-reduced-motion: reduce)').matches
      && !matchMedia('(pointer: coarse)').matches,
    particles: false,
    fluidSim: false,
    textSplit: !matchMedia('(prefers-reduced-motion: reduce)').matches,
    parallax: !matchMedia('(prefers-reduced-motion: reduce)').matches,
    dragReorder: false,
    commandPalette: true,
    exitIntent: false,
    serviceWorker: false,
    liveMetrics: false,
  },
  api: {
    translation: ENV.VITE_TRANSLATION_API_URL || '',
    translationKey: ENV.VITE_TRANSLATION_API_KEY || '',
    ws: ENV.VITE_WS_URL || '',
    imageCDN: ENV.VITE_IMAGE_CDN_URL || '',
    contact: ENV.VITE_CONTACT_API || '',
  },
  animation: {
    defaultDuration: 0.6,
    staggerBase: 80,
    scrollThreshold: 0.08,
    lazyLoadThreshold: 0.1,
  },
  breakpoints: {
    mobile: 600,
    tablet: 900,
  },
  storage: {
    theme: 'lgx-theme',
    preferences: 'lgx-prefs',
    locale: 'lgx-locale',
  },
});
