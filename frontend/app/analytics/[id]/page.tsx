'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/layouts/DashboardLayout';
import { api } from '@/lib/api'; 
import { auth } from '@/lib/auth';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeftIcon, CodeBracketIcon, ClipboardDocumentIcon,
  UsersIcon, EyeIcon, ClockIcon, QuestionMarkCircleIcon, ChartBarIcon
} from '@heroicons/react/24/outline';

import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';

export default function AnalyticsDetailsPage() {
  const { id } = useParams();
  const [site, setSite] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      const token = auth.getToken();
      if (!token || !id) return;

      try {
        const siteRes: any = await api.analytics.sites.get(token, Number(id));
        setSite(siteRes.data);

        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const statsRes = await fetch(`${apiBase}/analytics/sites/${id}/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (statsRes.ok) {
           const data = await statsRes.json();
           setStats(data.data);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  // Helper: Format Seconds
  const formatTime = (seconds: number) => {
    if (!seconds) return '0s';
    if (seconds < 60) return `${seconds}s`;
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const copyToClipboard = () => {
    if (!site) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const script = `<script defer src="${origin}/loader.js" data-tracking-code="${site.tracking_code}" data-endpoint="${origin}/api"></script>`;
    navigator.clipboard.writeText(script);
    toast.success('Copied to clipboard!');
  };

  if (loading) return (
    <DashboardLayout>
       <div className="flex justify-center items-center h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
       </div>
    </DashboardLayout>
  );

  if (!site) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-10">
        
        {/* Navigation */}
        <Link href="/analytics" className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 w-fit">
          <ArrowLeftIcon className="-ml-1 mr-1 h-5 w-5" /> Back to Analytics
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between">
           <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {site.name} 
              <span className="text-gray-400 font-normal text-lg">/ {site.domain}</span>
           </h1>
        </div>

        {/* --- IMPROVED VISIBILITY INSTALLATION CARD --- */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <CodeBracketIcon className="h-5 w-5 text-blue-600" />
                    Integration Guide
                </h3>
            </div>
            
            <div className="p-6 grid lg:grid-cols-2 gap-8">
                {/* Left: The Code Snippet (Simulated Syntax Highlighting) */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                            1. Copy Tracking Script
                        </label>
                        <span className="text-xs font-mono text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded border border-blue-100 dark:border-blue-800">
                            ID: {site.tracking_code}
                        </span>
                    </div>
                    
                    <div className="relative group shadow-sm">
                        <div className="absolute top-0 left-0 w-full h-full bg-gray-900 rounded-lg -z-10"></div>
                        <pre className="bg-gray-900 text-gray-300 p-5 rounded-lg text-xs md:text-sm font-mono overflow-x-auto border border-gray-700 leading-relaxed">
                            <span className="text-pink-400">&lt;script</span> <span className="text-orange-300">defer</span> <span className="text-blue-300">src</span>=<span className="text-green-300">"{origin}/loader.js"</span> <span className="text-blue-300">data-tracking-code</span>=<span className="text-green-300">"{site.tracking_code}"</span> <span className="text-blue-300">data-endpoint</span>=<span className="text-green-300">"{origin}/api"</span><span className="text-pink-400">&gt;&lt;/script&gt;</span>
                        </pre>
                        <button 
                            onClick={copyToClipboard}
                            className="absolute top-3 right-3 p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md shadow-md transition-all border border-gray-600"
                            title="Copy code"
                        >
                            <ClipboardDocumentIcon className="h-4 w-4" />
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Paste this snippet inside the <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-pink-600 font-mono text-xs">&lt;head&gt;</code> tag of every page.
                    </p>
                </div>

                {/* Right: How to Install (Better Visuals) */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl p-6 border border-blue-100 dark:border-gray-600">
                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-5">
                        <QuestionMarkCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" /> 
                        2. Choose your Platform
                    </h4>
                    
                    <div className="space-y-4">
                        {/* Guide Items */}
                        <div className="flex gap-4 items-start">
                            <div className="h-6 w-6 rounded-full bg-white dark:bg-gray-600 border border-blue-100 dark:border-gray-500 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-300 shadow-sm flex-shrink-0 mt-0.5">1</div>
                            <div>
                                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Plain HTML / PHP</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                                    Open your <code className="font-mono text-gray-800 dark:text-gray-200">index.html</code> (or common header file) and paste the code just before the closing <code className="font-mono text-gray-800 dark:text-gray-200">&lt;/head&gt;</code> tag.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                             <div className="h-6 w-6 rounded-full bg-white dark:bg-gray-600 border border-blue-100 dark:border-gray-500 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-300 shadow-sm flex-shrink-0 mt-0.5">2</div>
                            <div>
                                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">WordPress</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                                    Install the <span className="italic">"WPCode"</span> or <span className="italic">"Insert Headers and Footers"</span> plugin. Go to settings and paste into "Header Scripts".
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                             <div className="h-6 w-6 rounded-full bg-white dark:bg-gray-600 border border-blue-100 dark:border-gray-500 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-300 shadow-sm flex-shrink-0 mt-0.5">3</div>
                            <div>
                                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Next.js / React</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                                    Add the script to your root <code className="font-mono text-gray-800 dark:text-gray-200">layout.tsx</code> or use the <code className="font-mono text-gray-800 dark:text-gray-200">next/script</code> component.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* --- STATS CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-2">
                    <UsersIcon className="h-5 w-5" /> Unique Visitors
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.visitors || 0}</div>
                <div className="text-xs text-green-600 mt-1">Lifetime total</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-2">
                    <EyeIcon className="h-5 w-5" /> Total Pageviews
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.pageviews || 0}</div>
                <div className="text-xs text-green-600 mt-1">{stats?.recent || 0} in last 24h</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-2">
                    <ClockIcon className="h-5 w-5" /> Avg. Time on Site
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {formatTime(stats?.avg_duration || 0)}
                </div>
                <div className="text-xs text-green-600 mt-1">Avg per session</div>
            </div>
        </div>

        {/* --- CHART SECTION --- */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-[400px]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Traffic Overview (Last 24 Hours)</h3>
            
            {stats?.chart && stats.chart.length > 0 ? (
                <ResponsiveContainer width="100%" height="85%">
                    <AreaChart data={stats.chart}>
                        <defs>
                            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Area type="monotone" dataKey="views" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                    </AreaChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full mb-3">
                        <ChartBarIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <p>No traffic data for the chart yet.</p>
                </div>
            )}
        </div>

      </div>
    </DashboardLayout>
  );
}
