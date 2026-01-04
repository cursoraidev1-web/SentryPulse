'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuth } from '@/lib/hooks/useAuth';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import LoadingModal from '@/components/LoadingModal';

export default function IncidentsPage() {
  const { user, loading } = useAuth(true);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const loadIncidents = async () => {
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
          const status = filter === 'all' ? undefined : filter;

          const incidentsRes: any = await api.incidents.list(token, teamId, status);
          setIncidents(incidentsRes.data?.incidents || []);
        }
      } catch (error) {
        console.error('Failed to load incidents:', error);
      } finally {
        setDataLoading(false);
      }
    };

    if (!loading && user) {
      loadIncidents();
    } else if (!loading && !user) {
      setDataLoading(false);
    }
  }, [loading, user, filter]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'major':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'minor':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'investigating':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'identified':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'monitoring':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <DashboardLayout>
      <LoadingModal isOpen={dataLoading} message="Loading incidents..." />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Incidents</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monitor and manage incidents across your services
          </p>
        </div>

        <div className="flex space-x-2">
          {['all', 'investigating', 'identified', 'monitoring', 'resolved'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {incidents.length === 0 ? (
          <div className="card text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No incidents</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {filter === 'all' ? 'No incidents recorded' : `No ${filter} incidents`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {incidents.map((incident) => (
              <div key={incident.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{incident.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getSeverityColor(incident.severity)}`}>
                        {incident.severity}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(incident.status)}`}>
                        {incident.status}
                      </span>
                    </div>
                    {incident.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-3">{incident.description}</p>
                    )}
                    <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                      <div>
                        <span className="font-medium">Started:</span>{' '}
                        {format(new Date(incident.started_at), 'MMM d, yyyy HH:mm')}
                      </div>
                      {incident.resolved_at && (
                        <>
                          <div>
                            <span className="font-medium">Resolved:</span>{' '}
                            {format(new Date(incident.resolved_at), 'MMM d, yyyy HH:mm')}
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span>{' '}
                            {Math.floor(incident.duration_seconds / 60)} minutes
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
