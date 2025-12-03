/**
 * SentryPulse Analytics Loader
 * Async script loader for tracker.js
 * 
 * Usage:
 * <script data-tracking-code="SP_XXXXXXXXXXXX" src="https://your-domain.com/loader.js" async defer></script>
 */

(function() {
  'use strict';

  function loadTracker() {
    const currentScript = document.currentScript || (function() {
      const scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();

    if (!currentScript) {
      console.error('[SentryPulse] Could not find script tag');
      return;
    }

    const trackingCode = currentScript.getAttribute('data-tracking-code');
    const endpoint = currentScript.getAttribute('data-endpoint');
    const debug = currentScript.getAttribute('data-debug') === 'true';

    if (!trackingCode) {
      console.error('[SentryPulse] Missing data-tracking-code attribute');
      return;
    }

    window.SENTRYPULSE_TRACKING_CODE = trackingCode;
    
    if (endpoint) {
      window.SENTRYPULSE_ENDPOINT = endpoint;
    }

    if (debug) {
      window.SENTRYPULSE_DEBUG = true;
    }

    const scriptUrl = currentScript.src.replace('loader.js', 'tracker.js');

    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    script.defer = true;

    script.onerror = function() {
      console.error('[SentryPulse] Failed to load tracker script');
    };

    document.head.appendChild(script);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadTracker);
  } else {
    loadTracker();
  }

})();
