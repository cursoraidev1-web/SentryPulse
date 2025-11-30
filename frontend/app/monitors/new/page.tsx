'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuth } from '@/lib/hooks/useAuth';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';

export default function NewMonitorPage() {
  const { user, loading } = useAuth(true);
  const router = useRouter();
  const [teamId, setTeamId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    type: 'https',
    method: 'GET',
    interval: 60,
    timeout: 30,
    check_ssl: true,
    check_keyword: '',
    expected_status_code: 200,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadTeam = async () => {
      const token = auth.getToken();
      if (!token) return;

      try {
        const teamsResponse: any = await api.teams.list(token);
        const teams = teamsResponse.data?.teams || [];
        if (teams.length > 0) {
          setTeamId(teams[0].id);
        }
      } catch (error) {
        console.error('Failed to load team:', error);
      }
    };

    if (!loading && user) {
      loadTeam();
    }
  }, [loading, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId) return;

    setError('');
    setSubmitting(true);

    try {
      const token = auth.getToken();
      if (!token) throw new Error('Not authenticated');

      await api.monitors.create(token, {
        ...formData,
        team_id: teamId,
      });

      router.push('/monitors');
    } catch (err: any) {
      setError(err.message || 'Failed to create monitor');
    } finally {
      setSubmitting(false);
    }
  };

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
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Add Monitor</h1>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card space-y-6">
          <div>
            <label className="label">Monitor Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              placeholder="My Website"
            />
          </div>

          <div>
            <label className="label">URL</label>
            <input
              type="url"
              required
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="input"
              placeholder="https://example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="input"
              >
                <option value="https">HTTPS</option>
                <option value="http">HTTP</option>
              </select>
            </div>

            <div>
              <label className="label">Method</label>
              <select
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                className="input"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="HEAD">HEAD</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Check Interval (seconds)</label>
              <input
                type="number"
                min="30"
                max="3600"
                value={formData.interval}
                onChange={(e) => setFormData({ ...formData, interval: parseInt(e.target.value) })}
                className="input"
              />
            </div>

            <div>
              <label className="label">Timeout (seconds)</label>
              <input
                type="number"
                min="5"
                max="60"
                value={formData.timeout}
                onChange={(e) => setFormData({ ...formData, timeout: parseInt(e.target.value) })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label">Expected Status Code</label>
            <input
              type="number"
              value={formData.expected_status_code}
              onChange={(e) => setFormData({ ...formData, expected_status_code: parseInt(e.target.value) })}
              className="input"
            />
          </div>

          <div>
            <label className="label">Keyword Check (optional)</label>
            <input
              type="text"
              value={formData.check_keyword}
              onChange={(e) => setFormData({ ...formData, check_keyword: e.target.value })}
              className="input"
              placeholder="Text to find in response"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="check_ssl"
              checked={formData.check_ssl}
              onChange={(e) => setFormData({ ...formData, check_ssl: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="check_ssl" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">
              Check SSL certificate validity
            </label>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
            >
              {submitting ? 'Creating...' : 'Create Monitor'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
