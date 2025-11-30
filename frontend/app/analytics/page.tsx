'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuth } from '@/lib/hooks/useAuth';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function AnalyticsPage() {
  const { user, loading } = useAuth(true);
  const [sites, setSites] = useState<any[]>([]);
  const [teamId, setTeamId] = useState<number | null>(null);

  useEffect(() => {
    const loadSites = async () => {
      const token = auth.getToken();
      if (!token) return;

      try {
        const teamsResponse: any = await api.teams.list(token);
        const teams = teamsResponse.data?.teams || [];
        
        if (teams.length > 0) {
          const tid = teams[0].id;
          setTeamId(tid);

          const sitesRes: any = await api.analytics.sites.list(token, tid);
          setSites(sitesRes.data?.sites || []);
        }
      } catch (error) {
        console.error('Failed to load sites:', error);
      }
    };

    if (!loading && user) {
      loadSites();
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Privacy-focused website analytics
            </p>
          </div>
          <Link href="/analytics/new" className="btn btn-primary inline-flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Site
          </Link>
        </div>

        {sites.length === 0 ? (
          <div className="card text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No sites yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Get started by adding your first website
            </p>
            <Link href="/analytics/new" className="btn btn-primary inline-flex items-center">
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Site
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {sites.map((site) => (
              <Link key={site.id} href={`/analytics/${site.id}`}>
                <div className="card hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{site.name}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            site.is_enabled
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}
                        >
                          {site.is_enabled ? 'Active' : 'Paused'}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{site.domain}</p>
                      <div className="mt-3 flex items-center space-x-6 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Tracking Code:</span>{' '}
                          <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">
                            {site.tracking_code}
                          </code>
                        </div>
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
