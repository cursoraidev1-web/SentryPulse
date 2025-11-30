'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuth } from '@/lib/hooks/useAuth';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';

export default function DashboardPage() {
  const { user, loading } = useAuth(true);
  const [stats, setStats] = useState<any>(null);
  const [monitors, setMonitors] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      const token = auth.getToken();
      if (!token) return;

      try {
        const teamsResponse: any = await api.teams.list(token);
        const teams = teamsResponse.data?.teams || [];
        
        if (teams.length > 0) {
          const teamId = teams[0].id;

          const [monitorsRes, incidentsRes]: any = await Promise.all([
            api.monitors.list(token, teamId),
            api.incidents.list(token, teamId),
          ]);

          setMonitors(monitorsRes.data?.monitors || []);
          setIncidents(incidentsRes.data?.incidents || []);

          const upMonitors = (monitorsRes.data?.monitors || []).filter((m: any) => m.status === 'up').length;
          const totalMonitors = monitorsRes.data?.monitors?.length || 0;

          setStats({
            totalMonitors,
            upMonitors,
            downMonitors: totalMonitors - upMonitors,
            activeIncidents: (incidentsRes.data?.incidents || []).filter((i: any) => i.status !== 'resolved').length,
          });
        }
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      }
    };

    if (!loading && user) {
      loadDashboard();
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Overview of your monitoring and analytics
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Monitors</p>
                  <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{stats.totalMonitors}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Up</p>
                  <p className="mt-1 text-3xl font-semibold text-green-600">{stats.upMonitors}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Down</p>
                  <p className="mt-1 text-3xl font-semibold text-red-600">{stats.downMonitors}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Incidents</p>
                  <p className="mt-1 text-3xl font-semibold text-orange-600">{stats.activeIncidents}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Monitors</h2>
            {monitors.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No monitors yet</p>
            ) : (
              <div className="space-y-3">
                {monitors.slice(0, 5).map((monitor) => (
                  <div key={monitor.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{monitor.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{monitor.url}</p>
                    </div>
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
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Incidents</h2>
            {incidents.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No incidents</p>
            ) : (
              <div className="space-y-3">
                {incidents.slice(0, 5).map((incident) => (
                  <div key={incident.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900 dark:text-white">{incident.title}</p>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          incident.status === 'resolved'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                        }`}
                      >
                        {incident.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{incident.description || 'No description'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
