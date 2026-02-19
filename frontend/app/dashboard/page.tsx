'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuth } from '@/lib/hooks/useAuth';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';

export default function DashboardPage() {
  const { user, loading } = useAuth(true);
  
  // State
  const [stats, setStats] = useState<any>(null);
  const [monitors, setMonitors] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 1. Fetch Logic
  const loadDashboard = useCallback(async () => {
    const token = auth.getToken();
    if (!token) return;

    try {
      // Get Teams
      const teamsResponse: any = await api.teams.list(token);
      
      // 🚨 FIX: The API returns the array directly in .data, not .data.teams
      // We check both just to be safe
      const teams = Array.isArray(teamsResponse.data) 
        ? teamsResponse.data 
        : (teamsResponse.data?.teams || []);

      if (teams.length > 0) {
        const teamId = teams[0].id;

        // Fetch Data
        const [monitorsRes, incidentsRes]: any = await Promise.all([
          api.monitors.list(token, teamId),
          api.incidents.list(token, teamId),
        ]);

        // Safety checks for data arrays
        // Backend might send { data: [...] } OR { data: { monitors: [...] } }
        const monitorsArray = Array.isArray(monitorsRes.data) 
          ? monitorsRes.data 
          : (monitorsRes.data?.monitors || []);

        const incidentsArray = Array.isArray(incidentsRes.data) 
          ? incidentsRes.data 
          : (incidentsRes.data?.incidents || []);

        setMonitors(monitorsArray);
        setIncidents(incidentsArray);

        // Calculate Stats
        const upMonitors = monitorsArray.filter((m: any) => m.status === 'up').length;
        const totalMonitors = monitorsArray.length;

        setStats({
          totalMonitors,
          upMonitors,
          downMonitors: totalMonitors - upMonitors,
          activeIncidents: incidentsArray.filter((i: any) => i.status !== 'resolved').length,
        });
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    }
  }, []);

  // 2. Initial Load
  useEffect(() => {
    if (!loading && user?.id) {
      loadDashboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user?.id]); 

  // 3. Refresh Handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboard();
    setTimeout(() => setIsRefreshing(false), 500);
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

  // Simplified button class
  const refreshBtnClass = isRefreshing 
    ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500' 
    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Overview of your monitoring and analytics
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              href="/monitors/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              + Add Monitor
            </Link>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${refreshBtnClass}`}
            >
              <svg 
                className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={2} 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>

        {/* STATS */}
        {stats && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Monitors</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{stats.totalMonitors}</p>
              </div>
            </div>

            <div className="card">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Up</p>
                <p className="mt-1 text-3xl font-semibold text-green-600">{stats.upMonitors}</p>
              </div>
            </div>

            <div className="card">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Down</p>
                <p className="mt-1 text-3xl font-semibold text-red-600">{stats.downMonitors}</p>
              </div>
            </div>

            <div className="card">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Incidents</p>
                <p className="mt-1 text-3xl font-semibold text-orange-600">{stats.activeIncidents}</p>
              </div>
            </div>
          </div>
        )}

        {/* LISTS */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Monitors List */}
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
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        monitor.status === 'up' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {monitor.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Incidents List */}
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
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          incident.status === 'resolved' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                      }`}>
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
