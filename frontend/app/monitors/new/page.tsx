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
  ClockIcon, 
  AdjustmentsHorizontalIcon,
  BuildingOfficeIcon 
} from '@heroicons/react/24/outline';

export default function NewMonitorPage() {
  const { user, loading } = useAuth(true);
  const router = useRouter();
  
  // State for Team Management
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | string>('');
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);

  // Form State
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

      // Format URL correctly
      let finalUrl = formData.url;
      finalUrl = finalUrl.replace(/^https?:\/\//, '');
      finalUrl = `${formData.type}://${finalUrl}`;

      await api.monitors.create(token, {
        ...formData,
        url: finalUrl,
        team_id: Number(selectedTeamId),
      });

      toast.success('Monitor created successfully');
      
      // Redirect back to the list to see the new monitor
      router.push('/monitors');
    } catch (err: any) {
      console.error('Submit Error:', err);
      toast.error(err.message || 'Failed to create monitor.');
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
            You need a team workspace to create monitors.
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
            <Link href="/monitors" className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
              <ArrowLeftIcon className="-ml-1 mr-1 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
              Back
            </Link>
          </nav>
          <div className="mt-2 md:flex md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
                Create Monitor
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

          {/* Card 1: General Details */}
          <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
             <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white flex items-center gap-2">
                    <GlobeAltIcon className="h-5 w-5 text-primary-600" />
                    Target Details
                </h3>
             </div>
             
             <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
                    <div className="sm:col-span-4">
                        <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                            Monitor Name
                        </label>
                        <div className="mt-2">
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 dark:bg-gray-900 dark:ring-gray-700 dark:text-white sm:text-sm sm:leading-6"
                                placeholder="e.g. Marketing Site Homepage"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-6">
                        <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                            Target URL
                        </label>
                        <div className="mt-2 flex rounded-md shadow-sm">
                            <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 px-3 text-gray-500 dark:border-gray-700 dark:bg-gray-800 sm:text-sm">
                                {formData.type}://
                            </span>
                            <input
                                type="text"
                                required
                                value={formData.url.replace(/^https?:\/\//, '')}
                                onChange={(e) => setFormData({ ...formData, url: e.target.value.replace(/^https?:\/\//, '') })}
                                className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-0 py-2.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 dark:bg-gray-900 dark:ring-gray-700 dark:text-white sm:text-sm sm:leading-6"
                                placeholder="www.example.com"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                            Protocol
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="mt-2 block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 dark:bg-gray-900 dark:ring-gray-700 dark:text-white sm:text-sm sm:leading-6"
                        >
                            <option value="https">HTTPS</option>
                            <option value="http">HTTP</option>
                        </select>
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                            HTTP Method
                        </label>
                        <select
                            value={formData.method}
                            onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                            className="mt-2 block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 dark:bg-gray-900 dark:ring-gray-700 dark:text-white sm:text-sm sm:leading-6"
                        >
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                            <option value="HEAD">HEAD</option>
                        </select>
                    </div>
                </div>
             </div>
          </div>

          {/* Card 2: Configuration */}
          <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
             <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white flex items-center gap-2">
                    <AdjustmentsHorizontalIcon className="h-5 w-5 text-primary-600" />
                    Check Configuration
                </h3>
             </div>
             
             <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
                    
                    {/* RESTORED FIELD: Interval */}
                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                            Check Interval
                        </label>
                        <div className="relative mt-2 rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <ClockIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                            <input
                                type="number"
                                min="30"
                                max="3600"
                                value={formData.interval}
                                onChange={(e) => setFormData({ ...formData, interval: parseInt(e.target.value) })}
                                className="block w-full rounded-md border-0 py-2.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 dark:bg-gray-900 dark:ring-gray-700 dark:text-white sm:text-sm sm:leading-6"
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                <span className="text-gray-500 sm:text-sm">seconds</span>
                            </div>
                        </div>
                    </div>

                    {/* RESTORED FIELD: Timeout */}
                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                            Request Timeout
                        </label>
                        <div className="relative mt-2 rounded-md shadow-sm">
                            <input
                                type="number"
                                min="5"
                                max="60"
                                value={formData.timeout}
                                onChange={(e) => setFormData({ ...formData, timeout: parseInt(e.target.value) })}
                                className="block w-full rounded-md border-0 py-2.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 dark:bg-gray-900 dark:ring-gray-700 dark:text-white sm:text-sm sm:leading-6"
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                <span className="text-gray-500 sm:text-sm">seconds</span>
                            </div>
                        </div>
                    </div>

                    {/* RESTORED FIELD: Expected Status Code */}
                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                            Expected Status Code
                        </label>
                        <input
                            type="number"
                            value={formData.expected_status_code}
                            onChange={(e) => setFormData({ ...formData, expected_status_code: parseInt(e.target.value) })}
                            className="mt-2 block w-full rounded-md border-0 py-2.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 dark:bg-gray-900 dark:ring-gray-700 dark:text-white sm:text-sm sm:leading-6"
                        />
                    </div>

                    {/* RESTORED FIELD: Keyword Check */}
                    <div className="sm:col-span-6">
                        <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                            Keyword Check <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <input
                            type="text"
                            value={formData.check_keyword}
                            onChange={(e) => setFormData({ ...formData, check_keyword: e.target.value })}
                            className="mt-2 block w-full rounded-md border-0 py-2.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 dark:bg-gray-900 dark:ring-gray-700 dark:text-white sm:text-sm sm:leading-6"
                            placeholder="e.g. Welcome to SentryPulse"
                        />
                        <p className="mt-1 text-xs text-gray-500">Alert if this text is missing from the response body.</p>
                    </div>
                </div>
                
                {/* RESTORED FIELD: SSL Checkbox */}
                <div className="relative flex gap-x-3 pt-2">
                    <div className="flex h-6 items-center">
                        <input
                            id="check_ssl"
                            name="check_ssl"
                            type="checkbox"
                            checked={formData.check_ssl}
                            onChange={(e) => setFormData({ ...formData, check_ssl: e.target.checked })}
                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-900"
                        />
                    </div>
                    <div className="text-sm leading-6">
                        <label htmlFor="check_ssl" className="font-medium text-gray-900 dark:text-white">Check SSL Certificate</label>
                        <p className="text-gray-500 dark:text-gray-400">Alert if certificate is expired or invalid.</p>
                    </div>
                </div>
             </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-x-4">
             <Link
               href="/monitors"
               className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white"
             >
               Cancel
             </Link>
             <button
               type="submit"
               disabled={submitting}
               className="rounded-md bg-primary-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
             >
               {submitting ? 'Creating...' : 'Create Monitor'}
             </button>
          </div>

        </form>
      </div>
    </DashboardLayout>
  );
}