'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuth } from '@/lib/hooks/useAuth';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import { 
  PlusIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  PlayIcon,
  TrashIcon,
  ServerIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

export default function MonitorsPage() {
  const { user, loading } = useAuth(true);
  const [monitors, setMonitors] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const token = auth.getToken();
      if (!token) return;

      try {
        const teamsResponse: any = await api.teams.list(token);
        
        // --- FIX: Robust Team Parsing (Same as Create Page) ---
        const rawData = teamsResponse.data;
        const teams = Array.isArray(rawData) ? rawData : (rawData?.teams || []);
        
        if (teams.length > 0) {
          const tid = teams[0].id;
          
          // Now fetch monitors for this team
          const monitorsRes: any = await api.monitors.list(token, tid);
          setMonitors(monitorsRes.data?.monitors || []);
        } else {
            console.log('No teams found, cannot fetch monitors.');
        }
      } catch (error) {
        console.error('Failed to load monitors:', error);
      } finally {
        setDataLoading(false);
      }
    };

    if (!loading && user) {
      loadData();
    }
  }, [loading, user]);

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.preventDefault(); // Prevent clicking the Link
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this monitor?')) return;
    const token = auth.getToken();
    if (!token) return;
    try {
      await api.monitors.delete(token, id);
      toast.success('Monitor deleted');
      // Remove from UI immediately
      setMonitors(prev => prev.filter(m => m.id !== id));
    } catch (error: any) {
      toast.error('Failed to delete monitor');
    }
  };

  if (loading || dataLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Monitors</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Monitor uptime and performance of your websites
            </p>
          </div>
          <Link href="/monitors/new" className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 transition-colors">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Monitor
          </Link>
        </div>

        {monitors.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
             <ServerIcon className="mx-auto h-12 w-12 text-gray-400" />
             <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No monitors yet</h3>
             <p className="mt-1 text-gray-500 dark:text-gray-400">
               Get started by creating your first monitor
             </p>
             <div className="mt-6">
                <Link href="/monitors/new" className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Monitor
                </Link>
             </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {monitors.map((monitor) => (
              <Link key={monitor.id} href={`/monitors/${monitor.id}`}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer group relative">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                         {/* Status Icon */}
                         {monitor.status === 'up' ? (
                            <CheckCircleIcon className="h-6 w-6 text-green-500" />
                         ) : monitor.status === 'down' ? (
                            <XCircleIcon className="h-6 w-6 text-red-500" />
                         ) : (
                            <PlayIcon className="h-6 w-6 text-gray-400" />
                         )}
                         
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{monitor.name}</h3>
                        
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide ${
                            monitor.status === 'up'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : monitor.status === 'down'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {monitor.status}
                        </span>
                      </div>
                      
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">
                            {monitor.method}
                          </span>
                          <span className="truncate max-w-md">{monitor.url}</span>
                      </div>

                      <div className="mt-4 flex items-center space-x-6 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500 dark:text-gray-400">Interval:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{monitor.interval}s</span>
                        </div>
                        {monitor.last_response_time && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500 dark:text-gray-400">Response:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{monitor.last_response_time}ms</span>
                          </div>
                        )}
                        {monitor.check_ssl && (
                             <div className="flex items-center gap-1 text-gray-500">
                                <ShieldCheckIcon className="h-4 w-4" />
                                <span>SSL</span>
                             </div>
                        )}
                      </div>
                    </div>

                    {/* Delete Button (Floating) */}
                    <button
                        onClick={(e) => handleDelete(e, monitor.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Delete Monitor"
                    >
                        <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}