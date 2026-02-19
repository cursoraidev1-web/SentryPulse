'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function PublicStatusPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      try {
        const res: any = await api.statusPages.getBySlug(slug);
        setPage(res.data);
      } catch (e: any) {
        setError(e.message || 'Failed to load status page');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>{error || 'Status page not found'}</p>
        </div>
      </div>
    );
  }

  const monitors = page.monitors || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{page.name}</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Service status</p>
        </div>

        <div className="space-y-3">
          {monitors.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center text-gray-500 dark:text-gray-400">
              No services listed yet.
            </div>
          ) : (
            monitors.map((m: any) => (
              <div
                key={m.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow px-6 py-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {m.monitor_status === 'up' ? (
                    <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircleIcon className="h-6 w-6 text-red-500 flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{m.monitor_name}</p>
                    {m.last_checked_at && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Last checked: {new Date(m.last_checked_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    m.monitor_status === 'up'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  }`}
                >
                  {m.monitor_status === 'up' ? 'Operational' : 'Down'}
                </span>
              </div>
            ))
          )}
        </div>

        <p className="mt-8 text-center text-sm text-gray-400 dark:text-gray-500">
          Powered by SentryPulse
        </p>
      </div>
    </div>
  );
}
