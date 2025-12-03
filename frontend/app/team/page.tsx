'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuth } from '@/lib/hooks/useAuth';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';

export default function TeamPage() {
  const { user, loading } = useAuth(true);
  const [team, setTeam] = useState<any>(null);

  useEffect(() => {
    const loadTeam = async () => {
      const token = auth.getToken();
      if (!token) return;

      try {
        const teamsResponse: any = await api.teams.list(token);
        const teams = teamsResponse.data?.teams || [];
        
        if (teams.length > 0) {
          setTeam(teams[0]);
        }
      } catch (error) {
        console.error('Failed to load team:', error);
      }
    };

    if (!loading && user) {
      loadTeam();
    }
  }, [loading, user]);

  if (loading || !team) {
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Team Settings</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your team members and settings
          </p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Team Information</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Team Name</label>
              <input
                type="text"
                value={team.name}
                className="input"
                readOnly
              />
            </div>
            <div>
              <label className="label">Team Plan</label>
              <div className="px-4 py-2 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
                <span className="text-primary-700 dark:text-primary-300 font-semibold uppercase">
                  {team.plan}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Team Members</h2>
            <button className="btn btn-primary">Invite Member</button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                  {user?.name?.[0] || 'U'}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 rounded-full text-sm font-semibold">
                Owner
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
