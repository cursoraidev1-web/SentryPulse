/**
 * SentryPulse Analytics Tracker
 * Privacy-focused website analytics
 */

(function() {
  'use strict';

  const CONFIG = {
    endpoint: window.SENTRYPULSE_ENDPOINT || 'http://localhost:8000/api/analytics/collect',
    trackingCode: window.SENTRYPULSE_TRACKING_CODE || '',
    debug: false,
  };

  const SESSION_KEY = 'sp_session_id';
  const SESSION_DURATION = 30 * 60 * 1000;

  function log(...args) {
    if (CONFIG.debug) {
      console.log('[SentryPulse]', ...args);
    }
  }

  function generateId() {
    return 'sp_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  function getSessionId() {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (Date.now() - data.timestamp < SESSION_DURATION) {
          data.timestamp = Date.now();
          localStorage.setItem(SESSION_KEY, JSON.stringify(data));
          return data.id;
        }
      }
    } catch (e) {
      log('Error reading session:', e);
    }

    const sessionId = generateId();
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        id: sessionId,
        timestamp: Date.now(),
      }));
    } catch (e) {
      log('Error storing session:', e);
    }

    return sessionId;
  }

  function parseUrl(url) {
    const a = document.createElement('a');
    a.href = url || window.location.href;
    
    const params = new URLSearchParams(a.search);
    
    return {
      url: a.pathname + a.search,
      referrer: document.referrer || null,
      utm_source: params.get('utm_source') || null,
      utm_medium: params.get('utm_medium') || null,
      utm_campaign: params.get('utm_campaign') || null,
    };
  }

  function getBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    let os = 'Unknown';

    if (ua.indexOf('Firefox') > -1) {
      browser = 'Firefox';
    } else if (ua.indexOf('Chrome') > -1) {
      browser = 'Chrome';
    } else if (ua.indexOf('Safari') > -1) {
      browser = 'Safari';
    } else if (ua.indexOf('Edge') > -1) {
      browser = 'Edge';
    }

    if (ua.indexOf('Windows') > -1) {
      os = 'Windows';
    } else if (ua.indexOf('Mac') > -1) {
      os = 'macOS';
    } else if (ua.indexOf('Linux') > -1) {
      os = 'Linux';
    } else if (ua.indexOf('Android') > -1) {
      os = 'Android';
    } else if (ua.indexOf('iOS') > -1) {
      os = 'iOS';
    }

    return { browser, os };
  }

  function getDeviceType() {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  function sendData(data) {
    if (!CONFIG.trackingCode) {
      log('Error: Tracking code not configured');
      return;
    }

    const payload = {
      tracking_code: CONFIG.trackingCode,
      ...data,
      session_id: getSessionId(),
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      device_type: getDeviceType(),
      ...getBrowserInfo(),
    };

    log('Sending data:', payload);

    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon(CONFIG.endpoint, blob);
    } else {
      fetch(CONFIG.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(err => log('Error sending data:', err));
    }
  }

  function trackPageview(url) {
    const urlData = parseUrl(url);
    sendData(urlData);
    log('Pageview tracked:', urlData.url);
  }

  function trackEvent(eventName, properties) {
    const urlData = parseUrl();
    sendData({
      event_name: eventName,
      properties: properties || {},
      url: urlData.url,
    });
    log('Event tracked:', eventName, properties);
  }

  function init() {
    if (!CONFIG.trackingCode) {
      log('Error: No tracking code provided');
      return;
    }

    trackPageview();

    let lastUrl = window.location.href;
    const observer = new MutationObserver(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        trackPageview(currentUrl);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    window.addEventListener('popstate', () => {
      trackPageview();
    });

    window.addEventListener('pushState', () => {
      trackPageview();
    });

    window.addEventListener('replaceState', () => {
      trackPageview();
    });
  }

  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function() {
    originalPushState.apply(this, arguments);
    window.dispatchEvent(new Event('pushState'));
  };

  history.replaceState = function() {
    originalReplaceState.apply(this, arguments);
    window.dispatchEvent(new Event('replaceState'));
  };

  window.sentryPulse = {
    track: trackEvent,
    trackPageview: trackPageview,
  };

  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }

})();
