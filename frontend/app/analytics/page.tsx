'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuth } from '@/lib/hooks/useAuth';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import { PlusIcon, ChartBarIcon, CodeBracketIcon } from '@heroicons/react/24/outline';

export default function AnalyticsPage() {
  const { user, loading } = useAuth(true);
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  
  const [sites, setSites] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // 1. Load Teams first
  useEffect(() => {
    const loadTeams = async () => {
      const token = auth.getToken();
      if (!token) return;

      try {
        const teamsResponse: any = await api.teams.list(token);
        const rawTeams = teamsResponse.data;
        const teamList = Array.isArray(rawTeams) ? rawTeams : (rawTeams?.teams || []);
        
        setTeams(teamList);

        // Default to the first team if not already selected
        if (teamList.length > 0 && !selectedTeamId) {
          setSelectedTeamId(teamList[0].id);
        }
      } catch (error) {
        console.error('Failed to load teams:', error);
      }
    };

    if (!loading && user) {
      loadTeams();
    }
  }, [loading, user]);

  // 2. Load Sites whenever Selected Team Changes
  useEffect(() => {
    const loadSites = async () => {
      if (!selectedTeamId) return;
      const token = auth.getToken();
      
      setDataLoading(true);
      try {
        const sitesRes: any = await api.analytics.sites.list(token, selectedTeamId);
        const rawSites = sitesRes.data;
        const siteList = Array.isArray(rawSites) ? rawSites : (rawSites?.sites || []);
        setSites(siteList);
      } catch (error) {
        console.error('Failed to load sites:', error);
      } finally {
        setDataLoading(false);
      }
    };

    loadSites();
  }, [selectedTeamId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-10">
        
        {/* HEADER & TEAM SELECTOR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your website tracking properties.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Team Switcher */}
            {teams.length > 0 && (
                <select 
                    value={selectedTeamId || ''}
                    onChange={(e) => setSelectedTeamId(Number(e.target.value))}
                    className="block rounded-md border-0 py-2 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-700"
                >
                    {teams.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>
            )}

            <Link href="/analytics/new" className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500">
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Site
            </Link>
          </div>
        </div>

        {/* LOADING STATE */}
        {dataLoading ? (
            <div className="py-20 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
                <p className="mt-2 text-gray-500">Loading sites for this team...</p>
            </div>
        ) : sites.length === 0 ? (
          /* EMPTY STATE */
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No sites in this team</h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Select a different team from the dropdown above, or create a new site.
            </p>
            <div className="mt-6">
              <Link href="/analytics/new" className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500">
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Site
              </Link>
            </div>
          </div>
        ) : (
          /* SITES GRID */
          <div className="grid gap-6">
            {sites.map((site) => (
              <Link key={site.id} href={`/analytics/${site.id}`}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                          {site.name}
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${site.is_enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              {site.is_enabled ? 'Active' : 'Paused'}
                          </span>
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{site.domain}</p>
                      
                      <div className="mt-3 flex items-center gap-2 text-xs text-gray-400 font-mono bg-gray-50 dark:bg-gray-900/50 px-2 py-1 rounded w-fit">
                        <CodeBracketIcon className="h-3 w-3" />
                        {site.tracking_code}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}