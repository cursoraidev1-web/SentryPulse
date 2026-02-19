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
  PlusIcon,
  TrashIcon,
  LinkIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

export default function StatusPageDetailPage() {
  const { id } = useParams();
  const [page, setPage] = useState<any>(null);
  const [monitors, setMonitors] = useState<any[]>([]);
  const [teamMonitors, setTeamMonitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(async () => {
    const token = auth.getToken();
    if (!token || !id) return;
    try {
      const res: any = await api.statusPages.get(token, Number(id));
      const data = res.data ?? res;
      setPage(data);
      setMonitors(data?.monitors || []);
      if (data?.team_id) {
        const monRes: any = await api.monitors.list(token, data.team_id);
        const list = Array.isArray(monRes.data) ? monRes.data : (monRes.data?.monitors || []);
        setTeamMonitors(list);
      }
    } catch (e) {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const addMonitor = async (monitorId: number) => {
    const token = auth.getToken();
    if (!token || !id) return;
    setAdding(true);
    try {
      await api.statusPages.addMonitor(token, Number(id), monitorId);
      toast.success('Monitor added');
      setShowAdd(false);
      load();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add');
    } finally {
      setAdding(false);
    }
  };

  const removeMonitor = async (monitorId: number) => {
    const token = auth.getToken();
    if (!token || !id) return;
    try {
      await api.statusPages.removeMonitor(token, Number(id), monitorId);
      toast.success('Monitor removed');
      load();
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove');
    }
  };

  if (loading || !page) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      </DashboardLayout>
    );
  }

  const onPageIds = new Set((monitors || []).map((m: any) => m.monitor_id));
  const available = teamMonitors.filter((m: any) => !onPageIds.has(m.id));
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href="/status-pages" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeftIcon className="h-5 w-5 mr-1" /> Back to Status Pages
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{page.name}</h1>
            <a
              href={`${origin}/status/${page.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary-600 hover:underline mt-1"
            >
              <LinkIcon className="h-4 w-4" />
              {origin}/status/{page.slug}
            </a>
          </div>
          <a
            href={`${origin}/status/${page.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary inline-flex items-center"
          >
            View public page
          </a>
        </div>

        <div className="card">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Monitors on this page</h2>
            <button
              type="button"
              onClick={() => setShowAdd(!showAdd)}
              className="btn btn-primary inline-flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" /> Add monitor
            </button>
          </div>

          {showAdd && (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              {available.length === 0 ? (
                <p className="text-sm text-gray-500">All team monitors are already on this page.</p>
              ) : (
                <ul className="space-y-2">
                  {available.map((m: any) => (
                    <li key={m.id} className="flex items-center justify-between">
                      <span className="text-gray-900 dark:text-white">{m.name}</span>
                      <button
                        type="button"
                        onClick={() => addMonitor(m.id)}
                        disabled={adding}
                        className="btn btn-primary text-sm py-1 px-3"
                      >
                        Add
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {monitors.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No monitors yet. Add monitors to show them on the public page.</p>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {monitors.map((m: any) => (
                <li key={m.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {m.monitor_status === 'up' ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-medium text-gray-900 dark:text-white">{m.monitor_name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${m.monitor_status === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {m.monitor_status || 'pending'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMonitor(m.monitor_id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Remove from page"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}