'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuth } from '@/lib/hooks/useAuth';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import LoadingModal from '@/components/LoadingModal';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const { user, loading } = useAuth(true);
  const [stats, setStats] = useState<any>(null);
  const [monitors, setMonitors] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
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
      } finally {
        setDataLoading(false);
      }
    };

    if (!loading && user) {
      loadDashboard();
    } else if (!loading && !user) {
      setDataLoading(false);
    }
  }, [loading, user]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  const statCards = [
    {
      title: 'Total Monitors',
      value: stats?.totalMonitors || 0,
      icon: ChartBarIcon,
    },
    {
      title: 'Up',
      value: stats?.upMonitors || 0,
      icon: CheckCircleIcon,
      textColor: 'text-primary-600 dark:text-primary-400',
    },
    {
      title: 'Down',
      value: stats?.downMonitors || 0,
      icon: XCircleIcon,
      textColor: 'text-gray-600 dark:text-gray-400',
    },
    {
      title: 'Active Incidents',
      value: stats?.activeIncidents || 0,
      icon: ExclamationTriangleIcon,
      textColor: 'text-primary-600 dark:text-primary-400',
    },
  ];

  return (
    <DashboardLayout>
      <LoadingModal isOpen={dataLoading} message="Loading dashboard..." />
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Overview of your monitoring and analytics
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.title}
                  className={`card ${index === 2 ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-primary-50 dark:bg-primary-900/20'} animate-slide-up`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        {stat.title}
                      </p>
                      <p className={`text-4xl font-bold ${stat.textColor || 'text-gray-900 dark:text-white'}`}>
                        {stat.value}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-primary-600 shadow-lg">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="card animate-slide-up" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Monitors</h2>
              <Link
                href="/monitors"
                className="text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
              >
                View all
              </Link>
            </div>
            {monitors.length === 0 ? (
              <div className="text-center py-12">
                <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No monitors yet</p>
                <Link
                  href="/monitors/new"
                  className="mt-4 inline-block btn btn-primary"
                >
                  Create your first monitor
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {monitors.slice(0, 5).map((monitor) => (
                  <div
                    key={monitor.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">
                        {monitor.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {monitor.url}
                      </p>
                    </div>
                    <span
                      className={`badge ${
                        monitor.status === 'up'
                          ? 'badge-success'
                          : 'badge-error'
                      } ml-3 flex-shrink-0`}
                    >
                      {monitor.status === 'up' ? (
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                      ) : (
                        <XCircleIcon className="w-4 h-4 mr-1" />
                      )}
                      {monitor.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card animate-slide-up" style={{ animationDelay: '500ms' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Incidents</h2>
              <Link
                href="/incidents"
                className="text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
              >
                View all
              </Link>
            </div>
            {incidents.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircleIcon className="w-12 h-12 text-primary-400 mx-auto mb-4" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No incidents</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">All systems operational</p>
              </div>
            ) : (
              <div className="space-y-3">
                {incidents.slice(0, 5).map((incident) => (
                  <div
                    key={incident.id}
                    className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold text-gray-900 dark:text-white flex-1">
                        {incident.title}
                      </p>
                    <span
                      className={`badge ${
                        incident.status === 'resolved'
                          ? 'badge-success'
                          : 'badge-info'
                      } ml-3 flex-shrink-0`}
                    >
                      {incident.status}
                    </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {incident.description || 'No description'}
                    </p>
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
