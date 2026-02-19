'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuth } from '@/lib/hooks/useAuth';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function StatusPagesPage() {
  const { user, loading } = useAuth(true);
  const [statusPages, setStatusPages] = useState<any[]>([]);
  const [teamId, setTeamId] = useState<number | null>(null);

  useEffect(() => {
    const loadStatusPages = async () => {
      const token = auth.getToken();
      if (!token) return;
      try {
        const teamsResponse: any = await api.teams.list(token);
        const teams = Array.isArray(teamsResponse.data) ? teamsResponse.data : (teamsResponse.data?.teams || []);
        if (teams.length > 0) {
          const tid = teams[0].id;
          setTeamId(tid);
          const statusPagesRes: any = await api.statusPages.list(token, tid);
          const list = Array.isArray(statusPagesRes.data) ? statusPagesRes.data : (statusPagesRes.data?.status_pages || []);
          setStatusPages(list);
        }
      } catch (error) {
        console.error('Failed to load status pages:', error);
      }
    };
    if (!loading && user) loadStatusPages();
  }, [loading, user]);

  const createButton = (
    <Link href="/status-pages/new" className="btn btn-primary inline-flex items-center">
      <PlusIcon className="h-5 w-5 mr-2" />
      Create Status Page
    </Link>
  );

  const content = statusPages.length === 0 ? (
    <div className="card text-center py-12">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No status pages yet</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4">
        Create a public status page for your services
      </p>
      {createButton}
    </div>
  ) : (
    <div className="grid gap-6">
      {statusPages.map((page) => (
        <Link key={page.id} href={`/status-pages/${page.id}`}>
          <div className="card hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{page.name}</h3>
                  <span
                    className={
                      page.is_public
                        ? 'px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }
                  >
                    {page.is_public ? 'Public' : 'Private'}
                  </span>
                </div>
                <div className="mt-2">
                  <a
                    href={typeof window !== 'undefined' ? `${window.location.origin}/status/${page.slug}` : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    {typeof window !== 'undefined' ? `${window.location.origin}/status/${page.slug}` : `/status/${page.slug}`}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Status Pages</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Public status pages for your services
            </p>
          </div>
          {createButton}
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          </div>
        ) : (
          content
        )}
      </div>
    </DashboardLayout>
  );
}
