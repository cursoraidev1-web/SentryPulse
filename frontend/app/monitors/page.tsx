'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuth } from '@/lib/hooks/useAuth';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import LoadingModal from '@/components/LoadingModal';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function MonitorsPage() {
  const { user, loading } = useAuth(true);
  const [monitors, setMonitors] = useState<any[]>([]);
  const [teamId, setTeamId] = useState<number | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const loadMonitors = async () => {
      const token = auth.getToken();
      if (!token) {
        setDataLoading(false);
        return;
      }

      setDataLoading(true);
      try {
        const teamsResponse: any = await api.teams.list(token);
        const teams = teamsResponse.data?.teams || [];
        
        if (teams.length > 0) {
          const tid = teams[0].id;
          setTeamId(tid);

          const monitorsRes: any = await api.monitors.list(token, tid);
          setMonitors(monitorsRes.data?.monitors || []);
        }
      } catch (error) {
        console.error('Failed to load monitors:', error);
      } finally {
        setDataLoading(false);
      }
    };

    if (!loading && user) {
      loadMonitors();
    } else if (!loading && !user) {
      setDataLoading(false);
    }
  }, [loading, user]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <LoadingModal isOpen={dataLoading} message="Loading monitors..." />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Monitors</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Monitor uptime and performance of your websites
            </p>
          </div>
          <Link href="/monitors/new" className="btn btn-primary inline-flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Monitor
          </Link>
        </div>

        {monitors.length === 0 ? (
          <div className="card text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No monitors yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Get started by creating your first monitor
            </p>
            <Link href="/monitors/new" className="btn btn-primary inline-flex items-center">
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Monitor
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {monitors.map((monitor) => (
              <Link key={monitor.id} href={`/monitors/${monitor.id}`}>
                <div className="card hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{monitor.name}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            monitor.status === 'up'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {monitor.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{monitor.url}</p>
                      <div className="mt-3 flex items-center space-x-6 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Type:</span>{' '}
                          <span className="font-medium text-gray-900 dark:text-white">{monitor.type.toUpperCase()}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Interval:</span>{' '}
                          <span className="font-medium text-gray-900 dark:text-white">{monitor.interval}s</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Uptime:</span>{' '}
                          <span className="font-medium text-gray-900 dark:text-white">{monitor.uptime_percentage}%</span>
                        </div>
                        {monitor.last_response_time && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Response:</span>{' '}
                            <span className="font-medium text-gray-900 dark:text-white">{monitor.last_response_time}ms</span>
                          </div>
                        )}
                      </div>
                    </div>
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
