(function() {
    'use strict';
  
    // --- CONFIGURATION ---
    var src = document.currentScript.src;
    // Check if running on localhost OR a local network IP (like 192.168.x.x)
    var isLocal = src.includes('localhost') || src.includes('127.0.0.1') || src.includes('192.168.');
    
    // Base API URL
    var API_BASE = isLocal 
      ? 'http://localhost:8000/api/analytics' 
      : 'https://api.sentrypulse.com/api/analytics'; 
    // ---------------------
  
    var script = document.currentScript;
    var trackingCode = script.getAttribute('data-website-id');
    var currentViewId = null; 
    var pulseInterval = null; 
  
    // 1. Helper Functions
    function getBrowser() {
        var ua = navigator.userAgent;
        if (ua.includes("Chrome")) return "Chrome";
        if (ua.includes("Firefox")) return "Firefox";
        if (ua.includes("Safari")) return "Safari";
        if (ua.includes("Edge")) return "Edge";
        return "Unknown";
    }

    function getOS() {
        var ua = navigator.userAgent;
        if (ua.includes("Win")) return "Windows";
        if (ua.includes("Mac")) return "MacOS";
        if (ua.includes("Linux")) return "Linux";
        if (ua.includes("Android")) return "Android";
        if (ua.includes("like Mac")) return "iOS";
        return "Unknown";
    }

    function getDevice() {
        var width = window.screen.width;
        if (width < 768) return "Mobile";
        if (width < 1024) return "Tablet";
        return "Desktop";
    }
  
    // 2. The Heartbeat (Pulse) - Runs every 5 seconds
    function startPulse(viewId) {
        if (pulseInterval) clearInterval(pulseInterval);
        currentViewId = viewId;

        pulseInterval = setInterval(function() {
            // Only count time if user is looking at the tab
            if (document.visibilityState === 'visible' && currentViewId) {
                fetch(API_BASE + '/pulse', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: currentViewId }),
                    keepalive: true
                }).catch(function(err) { /* Silent fail */ });
            }
        }, 5000); 
    }
  
    // 3. Main Tracking Function
    function trackPageView() {
        if (!trackingCode) return;
        if (pulseInterval) clearInterval(pulseInterval);

        var data = {
            tracking_code: trackingCode,
            url: window.location.href,
            referrer: document.referrer || null,
            browser: getBrowser(),
            os: getOS(),
            device: getDevice(),
            country: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
  
        fetch(API_BASE + '/collect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(function(response) { return response.json(); })
        .then(function(result) {
            // If backend saved it, start the timer!
            if (result.success && result.id) {
                startPulse(result.id);
            }
        })
        .catch(function(err) { console.warn('Analytics Error:', err); });
    }
  
    // 4. Handle Navigation
    var originalPushState = history.pushState;
    history.pushState = function() {
        originalPushState.apply(this, arguments);
        trackPageView();
    };
    window.addEventListener('popstate', trackPageView);
  
    if (document.readyState === 'complete') trackPageView();
    else window.addEventListener('load', trackPageView);
  
})();
