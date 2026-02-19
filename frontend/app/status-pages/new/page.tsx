'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuth } from '@/lib/hooks/useAuth';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import { toast } from 'react-hot-toast';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function NewStatusPagePage() {
  const { user, loading } = useAuth(true);
  const router = useRouter();
  const [teams, setTeams] = useState<any[]>([]);
  const [teamId, setTeamId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const token = auth.getToken();
      if (!token) return;
      try {
        const res: any = await api.teams.list(token);
        const list = Array.isArray(res.data) ? res.data : (res.data?.teams || []);
        setTeams(list);
        if (list.length > 0 && !teamId) setTeamId(list[0].id);
      } catch (e) {
        toast.error('Failed to load teams');
      }
    };
    if (!loading && user) load();
  }, [loading, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = auth.getToken();
    if (!token || !teamId || !name.trim()) {
      toast.error('Name and team are required');
      return;
    }
    setSubmitting(true);
    try {
      await api.statusPages.create(token, { team_id: teamId, name: name.trim() });
      toast.success('Status page created');
      router.push('/status-pages');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto">
        <Link href="/status-pages" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeftIcon className="h-5 w-5 mr-1" /> Back to Status Pages
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create Status Page</h1>
        <form onSubmit={handleSubmit} className="card space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Team</label>
            <select
              value={teamId ?? ''}
              onChange={(e) => setTeamId(Number(e.target.value))}
              className="input w-full"
              required
            >
              <option value="">Select team...</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Page name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Public Status"
              className="input w-full"
              required
            />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Creating...' : 'Create'}
            </button>
            <Link href="/status-pages" className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
