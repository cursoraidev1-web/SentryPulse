'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuth } from '@/lib/hooks/useAuth';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import { toast } from 'react-hot-toast';
import { 
  BuildingOfficeIcon, 
  UserGroupIcon, 
  PlusIcon,
  CreditCardIcon,
  ClipboardDocumentIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

export default function TeamPage() {
  const { user, loading } = useAuth(true);
  const [team, setTeam] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]); 
  const [dataLoading, setDataLoading] = useState(true);
  
  // UI States
  const [copied, setCopied] = useState(false);
  
  // Create Team States
  const [newTeamName, setNewTeamName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Invite States
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  const loadTeamData = async () => {
    const token = auth.getToken();
    if (!token) return;

    try {
      const teamsResponse: any = await api.teams.list(token);
      const teams = teamsResponse.data?.teams || [];
      
      if (teams.length > 0) {
        const currentTeam = teams[0];
        setTeam(currentTeam);
        
        // Since we don't have a "get all members" endpoint yet, 
        // we display the current user as the primary member for now.
        // In a full app, you would fetch api.teams.getMembers(id) here.
        setMembers([
            { ...user, role: currentTeam.role || 'owner' }
        ]);
      }
    } catch (error) {
      console.error('Failed to load team:', error);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      loadTeamData();
    }
  }, [loading, user]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    const token = auth.getToken();
    setIsCreating(true);
    try {
      const res: any = await api.teams.create(token, { name: newTeamName });
      toast.success('Workspace created successfully!');
      setTeam(res.data);
      setNewTeamName('');
      loadTeamData(); 
    } catch (error: any) {
      toast.error(error.message || 'Failed to create team');
    } finally {
      setIsCreating(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const token = auth.getToken();
    setIsInviting(true);
    try {
      // API call using the fix we made in api.ts
      await api.teams.addMember(token, team.id, inviteEmail);
      toast.success('Invitation sent successfully');
      setShowInviteModal(false);
      setInviteEmail('');
    } catch (error: any) {
      if (error.message.includes('404')) {
         toast.error('User not found. Ask them to register first.');
      } else {
         toast.error(error.message || 'Failed to invite member');
      }
    } finally {
      setIsInviting(false);
    }
  };

  const copyTeamId = () => {
    if (!team) return;
    navigator.clipboard.writeText(team.uuid || team.id);
    setCopied(true);
    toast.success('Team ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || dataLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[80vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                <p className="text-gray-500 animate-pulse">Loading workspace...</p>
            </div>
        </div>
      </DashboardLayout>
    );
  }

  // --- EMPTY STATE: NO TEAM ---
  if (!team) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[80vh] flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/20">
                <BuildingOfficeIcon className="h-10 w-10 text-primary-600 dark:text-primary-400" />
              </div>
              <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Welcome to SentryPulse
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Create a workspace to start monitoring your websites and APIs.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl ring-1 ring-gray-900/5 sm:rounded-xl sm:px-10 border border-gray-100 dark:border-gray-700">
              <form className="space-y-6" onSubmit={handleCreateTeam}>
                <div>
                  <label htmlFor="teamName" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                    Workspace Name
                  </label>
                  <div className="mt-2">
                    <input
                      id="teamName"
                      type="text"
                      required
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      placeholder="e.g. Acme Corp Engineering"
                      className="block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 dark:bg-gray-900 dark:ring-gray-700 dark:text-white sm:text-sm sm:leading-6 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex w-full justify-center rounded-md bg-primary-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                >
                  {isCreating ? 'Creating Workspace...' : 'Create Workspace'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // --- MAIN DASHBOARD: TEAM SETTINGS ---
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-10">
        {/* Page Header */}
        <div className="md:flex md:items-center md:justify-between border-b border-gray-200 dark:border-gray-700 pb-5">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
              Settings
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your workspace settings and team members.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-8 lg:grid-cols-3">
            
          {/* LEFT COLUMN: General Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 dark:ring-gray-700 sm:rounded-xl overflow-hidden">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white flex items-center gap-2">
                        <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                        General Information
                    </h3>
                    <div className="mt-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                                Workspace Name
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    value={team.name}
                                    readOnly
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 dark:bg-gray-900/50 dark:ring-gray-700 dark:text-gray-300 sm:text-sm sm:leading-6 cursor-not-allowed bg-gray-50"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                                Workspace ID
                            </label>
                            <div className="mt-2 flex rounded-md shadow-sm">
                                <input
                                    type="text"
                                    value={team.uuid || team.id} // Fallback to ID if UUID missing
                                    readOnly
                                    className="block w-full min-w-0 flex-1 rounded-none rounded-l-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 dark:bg-gray-900/50 dark:ring-gray-700 dark:text-gray-400 sm:text-sm sm:leading-6 bg-gray-50 text-ellipsis"
                                />
                                <button
                                    type="button"
                                    onClick={copyTeamId}
                                    className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:ring-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    {copied ? (
                                        <CheckIcon className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <ClipboardDocumentIcon className="h-4 w-4 text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Plan Card */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-black shadow-lg sm:rounded-xl overflow-hidden text-white relative">
                <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 rounded-full bg-white/10 blur-xl"></div>
                <div className="px-4 py-5 sm:p-6 relative z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CreditCardIcon className="h-6 w-6 text-primary-400" />
                            <h3 className="text-base font-semibold leading-6 text-white">
                                Current Plan
                            </h3>
                        </div>
                        <span className="inline-flex items-center rounded-full bg-primary-500/10 px-2 py-1 text-xs font-medium text-primary-400 ring-1 ring-inset ring-primary-500/20 uppercase tracking-wider">
                            {team.plan || 'Free'}
                        </span>
                    </div>
                    <p className="mt-4 text-sm text-gray-300">
                        You are currently on the {team.plan || 'Free'} tier. Upgrade to unlock more monitors and longer data retention.
                    </p>
                    <div className="mt-6">
                        <button type="button" className="text-sm font-semibold leading-6 text-white hover:text-primary-400 transition-colors">
                            Manage Subscription &rarr;
                        </button>
                    </div>
                </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Members */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 dark:ring-gray-700 sm:rounded-xl">
              <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                 <div>
                    <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white flex items-center gap-2">
                        <UserGroupIcon className="h-5 w-5 text-gray-400" />
                        Team Members
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Manage who has access to this workspace.
                    </p>
                 </div>
                 <button
                    type="button"
                    onClick={() => setShowInviteModal(true)}
                    className="inline-flex items-center justify-center gap-x-1.5 rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-all"
                  >
                    <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                    Invite Member
                  </button>
              </div>
              
              <ul role="list" className="divide-y divide-gray-100 dark:divide-gray-700">
                 {members.map((member: any, idx: number) => (
                    <li key={member.id || idx} className="flex items-center justify-between gap-x-6 px-4 py-5 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <div className="flex min-w-0 gap-x-4">
                        <div className="h-10 w-10 flex-none rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {member.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0 flex-auto">
                            <p className="text-sm font-semibold leading-6 text-gray-900 dark:text-white">{member.name}</p>
                            <p className="mt-1 truncate text-xs leading-5 text-gray-500 dark:text-gray-400">{member.email}</p>
                        </div>
                        </div>
                        <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                member.role === 'owner' 
                                ? 'bg-purple-50 text-purple-700 ring-purple-700/10 dark:bg-purple-900/20 dark:text-purple-400 dark:ring-purple-400/20' 
                                : 'bg-gray-50 text-gray-600 ring-gray-500/10 dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20'
                            }`}>
                                {member.role ? member.role.charAt(0).toUpperCase() + member.role.slice(1) : 'Member'}
                            </span>
                        </div>
                    </li>
                 ))}
                 {members.length === 0 && (
                     <li className="px-4 py-8 text-center text-gray-500 text-sm">
                         No members found.
                     </li>
                 )}
              </ul>
            </div>
          </div>

        </div>
      </div>

      {/* INVITE MODAL */}
      {showInviteModal && (
        <div className="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm transition-opacity" onClick={() => setShowInviteModal(false)}></div>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-gray-200 dark:border-gray-700">
                <div className="bg-white dark:bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30 sm:mx-0 sm:h-10 sm:w-10">
                      <PlusIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                      <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white" id="modal-title">
                        Invite Team Member
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Enter the email address of the registered user you want to add. They will get instant access.
                        </p>
                        <div className="mt-4 relative rounded-md shadow-sm">
                            <input 
                                type="email" 
                                placeholder="colleague@company.com"
                                value={inviteEmail}
                                autoFocus
                                onChange={(e) => setInviteEmail(e.target.value)}
                                className="block w-full rounded-md border-0 py-2.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 dark:bg-gray-900 dark:ring-gray-700 dark:text-white sm:text-sm sm:leading-6"
                            />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/30 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button 
                    type="button" 
                    onClick={handleInvite}
                    disabled={isInviting}
                    className="inline-flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 sm:ml-3 sm:w-auto disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                  >
                    {isInviting ? 'Sending...' : 'Send Invitation'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowInviteModal(false)}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 sm:mt-0 sm:w-auto transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}