'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/layouts/DashboardLayout';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeftIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  SignalIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ServerIcon,
  BoltIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

export default function MonitorDetailsPage() {
  const { id } = useParams();
  const [monitor, setMonitor] = useState<any>(null);
  const [checks, setChecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningCheck, setRunningCheck] = useState(false);

  const loadData = useCallback(async () => {
    const token = auth.getToken();
    if (!token || !id) return;
    try {
      const monRes: any = await api.monitors.get(token, Number(id));
      setMonitor(monRes.data?.monitor ?? monRes.data);
      const checksRes: any = await api.monitors.checks(token, Number(id));
      const raw = checksRes?.data;
      const list = Array.isArray(raw) ? raw : (raw?.checks || []);
      setChecks(list);
    } catch (error) {
      console.error('Failed to load details:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  const runCheckNow = async () => {
    const token = auth.getToken();
    if (!token || !id || runningCheck) return;
    setRunningCheck(true);
    try {
      await api.monitors.runCheck(token, Number(id));
      toast.success('Check completed');
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Check failed');
    } finally {
      setRunningCheck(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Just now';
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) { return dateString; }
  };

  const isSuccess = (check: any) => {
    if (check.status?.toLowerCase() === 'up') return true;
    if (check.status?.toLowerCase() === 'success') return true;
    if (check.status_code >= 200 && check.status_code < 300) return true;
    return false;
  };

  if (loading && !monitor) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="text-gray-500 animate-pulse">Loading monitor stats...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!monitor) return null;

  const currentStatus = monitor.status || 'pending';
  const isPending = currentStatus === 'pending';
  const isUp = currentStatus === 'up';

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-10">
        
        {/* Navigation */}
        <Link href="/monitors" className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 w-fit">
          <ArrowLeftIcon className="-ml-1 mr-1 h-5 w-5" /> Back to Monitors
        </Link>

        {/* --- HEADER CARD --- */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
           
           {/* Top Bar */}
           <div className="p-6 md:flex md:items-center md:justify-between bg-white dark:bg-gray-800">
              <div className="flex items-center gap-4">
                  <div className={`h-16 w-16 rounded-2xl flex items-center justify-center shadow-inner ${
                      isUp ? 'bg-green-50 text-green-600 dark:bg-green-900/20' : 
                      isPending ? 'bg-gray-100 text-gray-500 animate-pulse' :
                      'bg-red-50 text-red-600 dark:bg-red-900/20'
                  }`}>
                      {isUp ? <CheckCircleIcon className="h-10 w-10" /> : 
                       isPending ? <ServerIcon className="h-10 w-10" /> :
                       <ExclamationTriangleIcon className="h-10 w-10" />}
                  </div>

                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        {monitor.name}
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                             isUp ? 'bg-green-100 text-green-700 border border-green-200' : 
                             isPending ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                             'bg-red-100 text-red-700 border border-red-200'
                        }`}>
                            {isPending ? (
                                <>Initializing...</>
                            ) : isUp ? 'Operational' : 'Downtime'}
                        </span>
                    </h1>
                    <a href={monitor.url} target="_blank" className="mt-1 flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 hover:underline transition-colors">
                        <GlobeAltIcon className="h-4 w-4" />
                        {monitor.url}
                    </a>
                  </div>
              </div>
           </div>

           {/* Stats Grid */}
           <div className="grid grid-cols-2 md:grid-cols-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 divide-x divide-gray-100 dark:divide-gray-700">
               <div className="p-4 flex flex-col items-center justify-center text-center">
                   <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Check Interval</span>
                   <div className="flex items-center gap-1 text-sm font-semibold text-gray-900 dark:text-white">
                        <ClockIcon className="h-4 w-4 text-gray-400" />
                        {monitor.interval || 60} seconds
                   </div>
               </div>
               <div className="p-4 flex flex-col items-center justify-center text-center">
                   <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Request Type</span>
                   <div className="flex items-center gap-1 text-sm font-semibold text-gray-900 dark:text-white">
                        <ServerIcon className="h-4 w-4 text-gray-400" />
                        {monitor.method || 'GET'} / {monitor.type?.toUpperCase() || 'HTTP'}
                   </div>
               </div>
               <div className="p-4 flex flex-col items-center justify-center text-center">
                   <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Avg Response</span>
                   <div className="flex items-center gap-1 text-sm font-semibold text-gray-900 dark:text-white">
                        <BoltIcon className="h-4 w-4 text-yellow-500" />
                        {monitor.last_response_time ? `${monitor.last_response_time}ms` : '---'}
                   </div>
               </div>
               <div className="p-4 flex flex-col items-center justify-center text-center">
                   <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Security</span>
                   <div className={`flex items-center gap-1 text-sm font-semibold ${monitor.check_ssl ? 'text-green-600' : 'text-gray-400'}`}>
                        <ShieldCheckIcon className="h-4 w-4" />
                        {monitor.check_ssl ? 'SSL Active' : 'Unsecured'}
                   </div>
               </div>
           </div>
        </div>

        {/* History List */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Auto-refresh every 5s</span>
                  <button
                    type="button"
                    onClick={runCheckNow}
                    disabled={runningCheck}
                    className="inline-flex items-center gap-1.5 rounded-md bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-500 disabled:opacity-70"
                  >
                    <PlayIcon className="h-4 w-4" />
                    {runningCheck ? 'Checking…' : 'Check now'}
                  </button>
                </div>
            </div>
            <ul className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
                {checks.map((check: any) => {
                    const success = isSuccess(check);
                    return (
                        <li key={check.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-1.5 rounded-full ${success ? 'bg-green-100' : 'bg-red-100'}`}>
                                        {success ? (
                                            <CheckCircleIcon className="h-5 w-5 text-green-600" />
                                        ) : (
                                            <XCircleIcon className="h-5 w-5 text-red-600" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {success ? 'Operational' : 'Connection Failed'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {formatDate(check.checked_at || check.created_at || check.createdAt)}
                                        </p>
                                        {!success && check.error_message && (
                                            <div className="mt-1.5 flex items-center text-xs text-red-700 bg-red-50 border border-red-100 px-2 py-1 rounded-md w-fit">
                                                <ExclamationTriangleIcon className="h-3 w-3 mr-1.5" />
                                                {check.error_message}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                     <div className="flex items-center justify-end gap-1.5 mb-1">
                                        <SignalIcon className="h-3.5 w-3.5 text-gray-400" />
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">{check.response_time}ms</span>
                                     </div>
                                     {/* HERE IS THE GREEN BADGE CHANGE */}
                                     <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                                         success 
                                         ? 'bg-green-100 text-green-700 border-green-200' 
                                         : 'bg-red-50 text-red-600 border-red-200'
                                     }`}>
                                        HTTP {check.status_code || 'ERR'}
                                     </span>
                                </div>
                            </div>
                        </li>
                    );
                })}
                {checks.length === 0 && (
                    <li className="px-6 py-12 text-center">
                        <div className="mx-auto h-12 w-12 text-gray-300">
                            <ClockIcon />
                        </div>
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">Waiting for data</h3>
                        <p className="mt-1 text-sm text-gray-500">The scheduler will run the first check shortly.</p>
                    </li>
                )}
            </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}