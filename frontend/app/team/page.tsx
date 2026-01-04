'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuth } from '@/lib/hooks/useAuth';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import { 
  UserPlusIcon, 
  TrashIcon, 
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import LoadingModal from '@/components/LoadingModal';

interface TeamMember {
  id: number;
  user_id: number;
  role: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export default function TeamPage() {
  const { user, loading } = useAuth(true);
  const [team, setTeam] = useState<any>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [editingName, setEditingName] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [error, setError] = useState('');
  const [inviting, setInviting] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const loadTeam = async () => {
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
          const teamData = teams[0];
          setTeam(teamData);
          setTeamName(teamData.name);
          // Load team details to get members (we'll need to add this endpoint)
          await loadTeamDetails(teamData.id, token);
        }
      } catch (error) {
        console.error('Failed to load team:', error);
      } finally {
        setDataLoading(false);
      }
    };

    if (!loading && user) {
      loadTeam();
    } else if (!loading && !user) {
      setDataLoading(false);
    }
  }, [loading, user]);

  const loadTeamDetails = async (teamId: number, token: string) => {
    try {
      const teamResponse: any = await api.teams.get(token, teamId);
      const teamData = teamResponse.data?.team || teamResponse.data;
      setTeam(teamData);
      // Set members from team data
      if (teamData.members) {
        // Filter out the current user (owner) from members list since we show them separately
        setMembers(teamData.members.filter((m: TeamMember) => m.user_id !== teamData.owner_id));
      }
    } catch (error) {
      console.error('Failed to load team details:', error);
    }
  };

  const handleUpdateName = async () => {
    if (!team || !teamName.trim()) return;

    const token = auth.getToken();
    if (!token) return;

    try {
      await api.teams.update(token, team.id, { name: teamName });
      setTeam({ ...team, name: teamName });
      setEditingName(false);
    } catch (error: any) {
      setError(error.message || 'Failed to update team name');
    }
  };

  const handleInviteMember = async () => {
    if (!team || !inviteEmail.trim()) {
      setError('Please enter an email address');
      return;
    }

    const token = auth.getToken();
    if (!token) return;

    setError('');
    setInviting(true);

    try {
      // Search for user by email
      const userResponse: any = await api.users.search(token, inviteEmail);
      const userToAdd = userResponse.data?.user;

      if (!userToAdd) {
        setError('User not found with that email address');
        setInviting(false);
        return;
      }

      // Check if user is already a member
      if (members.some(m => m.user_id === userToAdd.id) || userToAdd.id === team.owner_id) {
        setError('This user is already a team member');
        setInviting(false);
        return;
      }

      // Add member to team
      await api.teams.addMember(token, team.id, userToAdd.id, inviteRole);
      setIsInviteOpen(false);
      setInviteEmail('');
      setInviteRole('member');
      
      // Reload team details to get updated members list
      await loadTeamDetails(team.id, token);
    } catch (error: any) {
      setError(error.message || 'Failed to invite member. Make sure the user has an account.');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!team) return;
    if (!confirm('Are you sure you want to remove this member?')) return;

    const token = auth.getToken();
    if (!token) return;

    try {
      await api.teams.removeMember(token, team.id, userId);
      loadTeamDetails(team.id, token);
    } catch (error: any) {
      setError(error.message || 'Failed to remove member');
    }
  };

  if (loading || !team) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  const isOwner = team.owner_id === user?.id;

  return (
    <DashboardLayout>
      <LoadingModal isOpen={dataLoading} message="Loading team..." />
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Team Settings</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your team members and settings
          </p>
        </div>

        {error && (
          <div className="card bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 animate-fade-in">
            <p className="text-sm text-red-800 dark:text-red-200 font-medium">{error}</p>
          </div>
        )}

        <div className="card animate-slide-up">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Team Information</h2>
          <div className="space-y-6">
            <div>
              <label className="label">Team Name</label>
              <div className="flex items-center gap-3">
                {editingName && isOwner ? (
                  <>
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="input flex-1"
                      autoFocus
                    />
                    <button
                      onClick={handleUpdateName}
                      className="btn btn-primary flex-shrink-0"
                    >
                      <CheckIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingName(false);
                        setTeamName(team.name);
                      }}
                      className="btn btn-secondary flex-shrink-0"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      value={team.name}
                      className="input flex-1 bg-gray-50 dark:bg-gray-700/50 cursor-not-allowed"
                      readOnly
                    />
                    {isOwner && (
                      <button
                        onClick={() => setEditingName(true)}
                        className="btn btn-ghost flex-shrink-0"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
            <div>
              <label className="label">Team Plan</label>
              <div className="px-4 py-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl">
                <span className="text-primary-700 dark:text-primary-300 font-bold uppercase">
                  {team.plan}
                </span>
              </div>
            </div>
            <div>
              <label className="label">Team ID</label>
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-sm font-mono text-gray-600 dark:text-gray-400">
                {team.uuid || team.id}
              </div>
            </div>
          </div>
        </div>

        <div className="card animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Team Members</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage who has access to your team
              </p>
            </div>
            {isOwner && (
              <button
                onClick={() => setIsInviteOpen(true)}
                className="btn btn-primary"
              >
                <UserPlusIcon className="w-5 h-5 mr-2" />
                Invite Member
              </button>
            )}
          </div>

          <div className="space-y-3">
            {/* Owner */}
            <div className="flex items-center justify-between p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-primary-800">
              <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold shadow-lg">
                  {user?.name?.[0] || 'U'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
              </div>
              <span className="badge badge-info px-4 py-2">
                Owner
              </span>
            </div>

            {/* Other Members */}
            {members.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No other team members</p>
                {isOwner && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Invite team members to collaborate
                  </p>
                )}
              </div>
            )}

            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold">
                    {member.user?.name?.[0] || 'M'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {member.user?.name || 'Unknown User'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {member.user?.email || 'No email'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="badge badge-info capitalize">
                    {member.role}
                  </span>
                  {isOwner && member.user_id !== team.owner_id && (
                    <button
                      onClick={() => handleRemoveMember(member.user_id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Remove member"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invite Member Modal */}
      <Transition show={isInviteOpen} as={Fragment}>
        <Dialog 
          onClose={() => {
            setIsInviteOpen(false);
            setInviteEmail('');
            setInviteRole('member');
            setError('');
          }} 
          className="relative z-50"
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="card max-w-md w-full">
                <Dialog.Title className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Invite Team Member
                </Dialog.Title>

                <div className="space-y-4">
                  <div>
                    <label className="label">Email Address</label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="input"
                      placeholder="user@example.com"
                    />
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      The user must already have an account on SentryPulse
                    </p>
                  </div>

                  <div>
                    <label className="label">Role</label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="input"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                      <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setIsInviteOpen(false);
                        setInviteEmail('');
                        setInviteRole('member');
                        setError('');
                      }}
                      className="btn btn-secondary flex-1"
                      disabled={inviting}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleInviteMember}
                      className="btn btn-primary flex-1"
                      disabled={inviting}
                    >
                      {inviting ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Adding...
                        </span>
                      ) : (
                        'Add Member'
                      )}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </DashboardLayout>
  );
}
