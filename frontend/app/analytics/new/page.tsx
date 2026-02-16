'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuth } from '@/lib/hooks/useAuth';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeftIcon, 
  GlobeAltIcon, 
  BuildingOfficeIcon 
} from '@heroicons/react/24/outline';

export default function NewSitePage() {
  const { user, loading } = useAuth(true);
  const router = useRouter();
  
  // State for Team Management
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | string>('');
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    timezone: 'UTC',
  });
  
  const [submitting, setSubmitting] = useState(false);

  // Load Teams on Mount
  useEffect(() => {
    const loadTeams = async () => {
      const token = auth.getToken();
      if (!token) return;

      try {
        const res: any = await api.teams.list(token);
        
        // Robust Data Extraction
        let teamList: any[] = [];
        if (Array.isArray(res)) teamList = res;
        else if (Array.isArray(res.data)) teamList = res.data;
        else if (res.data && Array.isArray(res.data.teams)) teamList = res.data.teams;
        
        setTeams(teamList);

        if (teamList.length > 0) {
          setSelectedTeamId(teamList[0].id);
        }
      } catch (error) {
        console.error('Failed to load teams:', error);
        toast.error('Could not load your teams.');
      } finally {
        setIsLoadingTeams(false);
      }
    };

    if (!loading && user) {
      loadTeams();
    }
  }, [loading, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTeamId) {
      toast.error('Please select a team first.');
      return;
    }

    setSubmitting(true);

    try {
      const token = auth.getToken();
      if (!token) throw new Error('Not authenticated');

      // Clean domain input (remove http:// or https://)
      let cleanDomain = formData.domain.replace(/^https?:\/\//, '').replace(/\/$/, '');

      await api.analytics.sites.create(token, {
        ...formData,
        domain: cleanDomain,
        team_id: Number(selectedTeamId),
      });

      toast.success('Site added successfully');
      router.push('/analytics');
    } catch (err: any) {
      console.error('Submit Error:', err);
      toast.error(err.message || 'Failed to add site.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || isLoadingTeams) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error State: No Teams
  if (teams.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full mb-4">
            <BuildingOfficeIcon className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">No Teams Found</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md">
            You need a team workspace to create analytics properties.
          </p>
          <div className="mt-8">
            <Link
              href="/team"
              className="rounded-md bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
            >
              Create New Team
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto pb-10">
        
        {/* Header */}
        <div className="mb-8">
          <nav className="sm:hidden" aria-label="Back">
            <Link href="/analytics" className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
              <ArrowLeftIcon className="-ml-1 mr-1 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
              Back
            </Link>
          </nav>
          <div className="mt-2 md:flex md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
                Add Website
              </h2>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* TEAM SELECTOR */}
          <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden px-4 py-5 sm:px-6">
             <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white mb-2">
                Assign to Team Workspace
             </label>
             <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 dark:bg-gray-900 dark:ring-gray-700 dark:text-white sm:text-sm sm:leading-6"
             >
                <option value="" disabled>Select a team...</option>
                {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                ))}
             </select>
          </div>

          {/* Card 1: Site Details */}
          <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
             <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white flex items-center gap-2">
                    <GlobeAltIcon className="h-5 w-5 text-primary-600" />
                    Property Details
                </h3>
             </div>
             
             <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
                    <div className="sm:col-span-4">
                        <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                            Site Name
                        </label>
                        <div className="mt-2">
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 dark:bg-gray-900 dark:ring-gray-700 dark:text-white sm:text-sm sm:leading-6"
                                placeholder="e.g. My Portfolio Blog"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-4">
                        <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                            Domain
                        </label>
                        <div className="mt-2">
                            <input
                                type="text"
                                required
                                value={formData.domain}
                                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                                className="block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 dark:bg-gray-900 dark:ring-gray-700 dark:text-white sm:text-sm sm:leading-6"
                                placeholder="example.com"
                            />
                            <p className="mt-1 text-xs text-gray-500">Do not include https:// or www</p>
                        </div>
                    </div>

                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                            Timezone
                        </label>
                        <select
                            value={formData.timezone}
                            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                            className="mt-2 block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 dark:bg-gray-900 dark:ring-gray-700 dark:text-white sm:text-sm sm:leading-6"
                        >
                            <option value="UTC">UTC (Universal Time)</option>
                            <option value="America/New_York">New York (EST)</option>
                            <option value="Europe/London">London (GMT)</option>
                            <option value="Asia/Tokyo">Tokyo (JST)</option>
                        </select>
                    </div>
                </div>
             </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-x-4">
             <Link
               href="/analytics"
               className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white"
             >
               Cancel
             </Link>
             <button
               type="submit"
               disabled={submitting}
               className="rounded-md bg-primary-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
             >
               {submitting ? 'Creating...' : 'Create Property'}
             </button>
          </div>

        </form>
      </div>
    </DashboardLayout>
  );
}