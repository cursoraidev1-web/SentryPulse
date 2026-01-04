'use client';

import Link from 'next/link';
import { 
  CheckCircleIcon,
  ServerIcon,
  ChartBarIcon,
  BellAlertIcon,
  ShieldCheckIcon,
  PresentationChartLineIcon,
  UserGroupIcon,
  BoltIcon,
  GlobeAltIcon,
  LockClosedIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export default function LandingPage() {
  const features = [
    {
      name: 'Uptime Monitoring',
      description: 'Monitor your websites and APIs 24/7 with HTTP, HTTPS, and ping checks. Get instant alerts when something goes down.',
      icon: ServerIcon,
    },
    {
      name: 'Real-time Analytics',
      description: 'Privacy-focused website analytics with pageview tracking, visitor insights, and custom event tracking.',
      icon: ChartBarIcon,
    },
    {
      name: 'Multi-Channel Alerts',
      description: 'Get notified via Email, Telegram, WhatsApp, or Webhooks when incidents occur. Never miss a critical event.',
      icon: BellAlertIcon,
    },
    {
      name: 'Status Pages',
      description: 'Create beautiful public status pages to keep your users informed about service health and incidents.',
      icon: PresentationChartLineIcon,
    },
    {
      name: 'SSL Monitoring',
      description: 'Automatically check SSL certificate validity and expiration dates to prevent security issues.',
      icon: ShieldCheckIcon,
    },
    {
      name: 'Team Collaboration',
      description: 'Work together with your team. Role-based access control ensures the right people have the right permissions.',
      icon: UserGroupIcon,
    },
  ];

  const benefits = [
    {
      title: 'Lightning Fast',
      description: 'Monitor checks run every 60 seconds by default. Get notified instantly when issues arise.',
      icon: BoltIcon,
    },
    {
      title: 'Global Coverage',
      description: 'Monitor from anywhere in the world. Ensure your services are accessible everywhere.',
      icon: GlobeAltIcon,
    },
    {
      title: 'Privacy First',
      description: 'GDPR-compliant analytics. Your data stays yours. No cookies, no tracking scripts.',
      icon: LockClosedIcon,
    },
    {
      title: '99.9% Uptime Tracking',
      description: 'Track your uptime percentage with precision. Historical data helps you identify patterns.',
      icon: ClockIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold gradient-text">SentryPulse</h1>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium">
                How It Works
              </a>
              <a href="#pricing" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium">
                Pricing
              </a>
              <Link
                href="/login"
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="btn btn-primary"
              >
                Get Started
              </Link>
            </div>
            <div className="md:hidden">
              <Link
                href="/register"
                className="btn btn-primary text-sm px-4 py-2"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center animate-fade-in">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6">
              Monitor Your Services
              <span className="block gradient-text mt-2">Like a Pro</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10">
              Website monitoring, analytics, and incident management all in one platform. 
              Keep your services running smoothly with real-time alerts and insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/register"
                className="btn btn-primary text-lg px-8 py-4 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                Start Monitoring Free
              </Link>
              <a
                href="#features"
                className="btn btn-secondary text-lg px-8 py-4"
              >
                Learn More
              </a>
            </div>
            <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>

          {/* Hero Image/Dashboard Preview */}
          <div className="mt-16 animate-slide-up">
            <div className="card p-8 shadow-2xl">
              <div className="bg-gray-900 rounded-xl p-4">
                <div className="flex gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 text-white">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-gray-700/50 rounded-lg p-4 animate-pulse">
                        <div className="h-4 bg-gray-600 rounded w-1/2 mb-2"></div>
                        <div className="h-8 bg-gray-600 rounded w-1/3"></div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-gray-700/50 rounded-lg p-4 animate-pulse">
                        <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-600 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="card text-center animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="inline-flex p-3 rounded-xl bg-primary-600 text-white mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Powerful features to monitor, analyze, and manage your services effectively
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.name}
                  className="card hover:scale-105 transition-transform duration-200 animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="inline-flex p-3 rounded-xl bg-primary-600 text-white mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {feature.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Get started in minutes. Here's how SentryPulse keeps your services running smoothly.
            </p>
          </div>

          <div className="space-y-16">
            {/* Step 1: Setup */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="animate-slide-up">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-600 text-white text-xl font-bold mb-4">
                  1
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Add Your Monitors
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                  Create monitors for your websites, APIs, or services. Simply enter the URL and configure check intervals, expected status codes, SSL validation, and keyword checks.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <span>HTTP/HTTPS health checks every 60 seconds</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <span>SSL certificate validation and expiration tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <span>Keyword validation to ensure content is correct</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <span>Response time tracking and uptime calculation</span>
                  </li>
                </ul>
              </div>
              <div className="card p-8 bg-white dark:bg-gray-900 shadow-xl animate-slide-up" style={{ animationDelay: '100ms' }}>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <ServerIcon className="w-6 h-6 text-primary-600" />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white">Production API</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">https://api.example.com</div>
                    </div>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded">UP</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <ServerIcon className="w-6 h-6 text-primary-600" />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white">Main Website</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">https://example.com</div>
                    </div>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded">UP</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <ServerIcon className="w-6 h-6 text-primary-600" />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white">Database Server</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">db.example.com:5432</div>
                    </div>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded">UP</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Monitoring */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 card p-8 bg-white dark:bg-gray-900 shadow-xl animate-slide-up">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border-l-4 border-primary-600 bg-primary-50 dark:bg-primary-900/20 rounded">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">Monitor Check</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Every 60 seconds</div>
                    </div>
                    <ClockIcon className="w-8 h-8 text-primary-600" />
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Status Code:</span>
                      <span className="font-mono text-gray-900 dark:text-white">200 OK</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Response Time:</span>
                      <span className="font-mono text-gray-900 dark:text-white">142ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">SSL Valid:</span>
                      <span className="font-mono text-green-600 dark:text-green-400">✓ Valid</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Uptime:</span>
                      <span className="font-mono text-gray-900 dark:text-white">99.97%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2 animate-slide-up" style={{ animationDelay: '100ms' }}>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-600 text-white text-xl font-bold mb-4">
                  2
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Continuous Monitoring
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                  Our system automatically checks your monitors at configured intervals. Each check validates response codes, SSL certificates, keywords, and tracks response times.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <span>Automated checks run in the background 24/7</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <span>Historical data stored for uptime calculation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <span>Real-time status updates in your dashboard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <span>Configurable check intervals (60s, 5min, 15min, etc.)</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 3: Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="animate-slide-up">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-600 text-white text-xl font-bold mb-4">
                  3
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Instant Alerts
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                  When a monitor goes down, we immediately create an incident and notify you through your preferred channels. No delays, no missed alerts.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <span>Multi-channel notifications (Email, Telegram, WhatsApp, Webhooks)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <span>Automatic incident creation and tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <span>Alert cooldown to prevent notification spam</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <span>Automatic resolution alerts when service recovers</span>
                  </li>
                </ul>
              </div>
              <div className="card p-8 bg-white dark:bg-gray-900 shadow-xl animate-slide-up" style={{ animationDelay: '100ms' }}>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded">
                    <BellAlertIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white">🚨 Service Down</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Production API is down</div>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Email sent to team@example.com
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Telegram notification delivered
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Webhook triggered to Slack
                    </div>
                  </div>
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Incident #1234 • Started 2 minutes ago
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 card p-8 bg-white dark:bg-gray-900 shadow-xl animate-slide-up">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Analytics Overview</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">12.5K</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Pageviews</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">3.2K</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Unique Visitors</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">8.1K</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Sessions</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">2:34</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Avg. Duration</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Privacy-focused • No cookies • GDPR compliant
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2 animate-slide-up" style={{ animationDelay: '100ms' }}>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-600 text-white text-xl font-bold mb-4">
                  4
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Privacy-First Analytics
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                  Track your website performance with our lightweight, privacy-focused analytics. No cookies, no tracking scripts—just clean, actionable insights.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <span>Simple one-line script integration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <span>Automatic pageview and event tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <span>UTM parameter tracking for campaigns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <span>Device, browser, and location insights</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 5: Status Pages */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="animate-slide-up">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-600 text-white text-xl font-bold mb-4">
                  5
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Public Status Pages
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                  Keep your users informed with beautiful, customizable status pages. Automatically display monitor status and incident updates.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <span>Custom domains and branding</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <span>Automatic incident updates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <span>Custom themes and CSS</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <span>Public API for status page data</span>
                  </li>
                </ul>
              </div>
              <div className="card p-8 bg-white dark:bg-gray-900 shadow-xl animate-slide-up" style={{ animationDelay: '100ms' }}>
                <div className="space-y-4">
                  <div className="text-center pb-4 border-b border-gray-200 dark:border-gray-700">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Service Status</h4>
                    <div className="text-sm text-gray-500 dark:text-gray-400">All systems operational</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">API</span>
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded">Operational</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Website</span>
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded">Operational</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Database</span>
                      <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-medium rounded">Degraded</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            <div className="animate-slide-up">
              <div className="text-5xl font-bold mb-2">99.9%</div>
              <div className="text-primary-100">Uptime Guarantee</div>
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div className="text-5xl font-bold mb-2">24/7</div>
              <div className="text-primary-100">Monitoring</div>
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
              <div className="text-5xl font-bold mb-2">&lt;1min</div>
              <div className="text-primary-100">Alert Response Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Choose the plan that works best for you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="card text-center animate-slide-up">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Free</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">$0</span>
                <span className="text-gray-600 dark:text-gray-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8 text-left">
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-primary-600" />
                  <span className="text-gray-700 dark:text-gray-300">5 Monitors</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-primary-600" />
                  <span className="text-gray-700 dark:text-gray-300">Email Alerts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-primary-600" />
                  <span className="text-gray-700 dark:text-gray-300">Basic Analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-primary-600" />
                  <span className="text-gray-700 dark:text-gray-300">1 Status Page</span>
                </li>
              </ul>
              <Link href="/register" className="btn btn-secondary w-full">
                Get Started
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="card text-center border-2 border-primary-500 scale-105 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div className="badge badge-info mb-4">Most Popular</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">$29</span>
                <span className="text-gray-600 dark:text-gray-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8 text-left">
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-primary-600" />
                  <span className="text-gray-700 dark:text-gray-300">50 Monitors</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-primary-600" />
                  <span className="text-gray-700 dark:text-gray-300">All Alert Channels</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-primary-600" />
                  <span className="text-gray-700 dark:text-gray-300">Advanced Analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-primary-600" />
                  <span className="text-gray-700 dark:text-gray-300">Unlimited Status Pages</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-primary-600" />
                  <span className="text-gray-700 dark:text-gray-300">Team Collaboration</span>
                </li>
              </ul>
              <Link href="/register" className="btn btn-primary w-full">
                Start Free Trial
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="card text-center animate-slide-up" style={{ animationDelay: '200ms' }}>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Enterprise</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">Custom</span>
              </div>
              <ul className="space-y-3 mb-8 text-left">
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-primary-600" />
                  <span className="text-gray-700 dark:text-gray-300">Unlimited Monitors</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-primary-600" />
                  <span className="text-gray-700 dark:text-gray-300">Priority Support</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-primary-600" />
                  <span className="text-gray-700 dark:text-gray-300">Custom Integrations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-primary-600" />
                  <span className="text-gray-700 dark:text-gray-300">SLA Guarantee</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-primary-600" />
                  <span className="text-gray-700 dark:text-gray-300">Dedicated Account Manager</span>
                </li>
              </ul>
              <Link href="/register" className="btn btn-secondary w-full">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center text-white animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-10">
            Join thousands of teams monitoring their services with SentryPulse
          </p>
          <Link
            href="/register"
            className="inline-block btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-4 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
          >
            Start Free Trial
          </Link>
          <p className="mt-6 text-primary-100 text-sm">
            No credit card required • Setup in minutes • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold gradient-text mb-4">SentryPulse</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Professional website monitoring and analytics platform
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Pricing</a></li>
                <li><Link href="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">About</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Privacy</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Terms</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200/50 dark:border-gray-700/50 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>&copy; {new Date().getFullYear()} SentryPulse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
