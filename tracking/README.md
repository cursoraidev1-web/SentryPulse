# SentryPulse Analytics Tracker

Privacy-focused website analytics tracking script.

## Installation

### Option 1: Using the Loader (Recommended)

Add this script to your website's HTML, preferably before the closing `</head>` tag:

```html
<script 
  data-tracking-code="SP_XXXXXXXXXXXX" 
  src="https://your-domain.com/loader.js" 
  async 
  defer
></script>
```

### Option 2: Direct Tracker

```html
<script>
  window.SENTRYPULSE_TRACKING_CODE = 'SP_XXXXXXXXXXXX';
</script>
<script src="https://your-domain.com/tracker.js" async defer></script>
```

## Configuration

### Attributes

- `data-tracking-code` (required): Your site's tracking code
- `data-endpoint` (optional): Custom API endpoint
- `data-debug` (optional): Enable debug logging (set to "true")

### Example with Custom Endpoint

```html
<script 
  data-tracking-code="SP_XXXXXXXXXXXX"
  data-endpoint="https://api.yourserver.com/analytics/collect"
  data-debug="true"
  src="https://your-domain.com/loader.js" 
  async 
  defer
></script>
```

## Tracking Events

Once installed, the tracker automatically tracks pageviews. To track custom events:

```javascript
// Track a custom event
window.sentryPulse.track('button_click', {
  button_id: 'cta-primary',
  page: 'homepage'
});

// Track a form submission
window.sentryPulse.track('form_submit', {
  form_name: 'contact',
  fields: 3
});

// Track a purchase
window.sentryPulse.track('purchase', {
  amount: 99.99,
  currency: 'USD',
  product_id: '12345'
});
```

## Features

- **Automatic Pageview Tracking**: Tracks page views including SPA navigation
- **Session Tracking**: Groups visitor actions into sessions
- **UTM Parameter Capture**: Automatically captures UTM parameters
- **Device Detection**: Identifies device type (desktop, mobile, tablet)
- **Browser & OS Detection**: Tracks browser and operating system
- **Privacy-Focused**: No cookies, IP addresses are hashed server-side
- **Lightweight**: Minimal impact on page load time
- **GDPR Compliant**: No personal data collection

## What Gets Tracked

### Automatic Data
- Page URL
- Referrer
- UTM parameters (source, medium, campaign)
- Browser type
- Operating system
- Device type
- Screen resolution
- Session ID (stored in localStorage)

### Custom Events
- Event name
- Custom properties (as JSON object)

## Privacy

- No cookies are used
- IP addresses are hashed on the server
- No personal information is collected
- Visitor IDs are generated from non-personal data
- Full GDPR compliance

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## CDN Deployment

For production use, host the tracker files on a CDN:

```bash
# Build minified version
npx terser tracker.js -o tracker.min.js --compress --mangle
npx terser loader.js -o loader.min.js --compress --mangle

# Upload to your CDN
aws s3 cp tracker.min.js s3://your-cdn-bucket/tracker.js
aws s3 cp loader.min.js s3://your-cdn-bucket/loader.js
```

## Troubleshooting

### Tracking not working

1. Check browser console for errors
2. Enable debug mode: `data-debug="true"`
3. Verify tracking code is correct
4. Ensure API endpoint is accessible
5. Check CORS configuration on API server

### Events not appearing

- Events may take a few minutes to appear in dashboard
- Check daily aggregation has run
- Verify site is enabled in dashboard

## License

Proprietary - SootheTech © 2025
