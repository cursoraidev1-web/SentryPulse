'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuth } from '@/lib/hooks/useAuth';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import { CheckIcon, CreditCardIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import LoadingModal from '@/components/LoadingModal';

interface Plan {
  id: string;
  name: string;
  price: string;
  priceNum: number;
  description: string;
  features: string[];
  popular: boolean;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    priceNum: 0,
    description: 'Perfect for getting started',
    features: [
      '5 monitors',
      '1 status page',
      '10,000 pageviews/month',
      'Email notifications',
      '24-hour data retention',
      'Community support',
    ],
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    priceNum: 29,
    description: 'For growing teams',
    features: [
      '50 monitors',
      'Unlimited status pages',
      '100,000 pageviews/month',
      'All notification channels',
      '90-day data retention',
      'API access',
      'Priority support',
    ],
    popular: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: '$99',
    priceNum: 99,
    description: 'For larger organizations',
    features: [
      'Unlimited monitors',
      'Unlimited status pages',
      'Unlimited pageviews',
      'All notification channels',
      '1-year data retention',
      'API access',
      'Priority support',
      'Custom domains',
      'SLA guarantee',
    ],
    popular: false,
  },
];

export default function BillingPage() {
  const { user, loading } = useAuth(true);
  const [team, setTeam] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
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
          const currentTeam = teams[0];
          setTeam(currentTeam);

          // Load usage data
          try {
            const usageRes: any = await api.billing.usage(token, currentTeam.id);
            setUsage(usageRes.data?.usage || null);
          } catch (err) {
            // Usage endpoint might not exist yet
            console.log('Usage data not available');
          }
        }
      } catch (error) {
        console.error('Failed to load team:', error);
      } finally {
        setDataLoading(false);
      }
    };

    if (!loading && user) {
      loadData();
    } else if (!loading && !user) {
      setDataLoading(false);
    }
  }, [loading, user]);

  const handleUpgrade = async () => {
    if (!team || !selectedPlan) return;

    const token = auth.getToken();
    if (!token) return;

    setUpdating(true);
    setError('');

    try {
      await api.billing.updatePlan(token, team.id, selectedPlan.id);
      setTeam({ ...team, plan: selectedPlan.id });
      setIsUpgradeOpen(false);
      setSelectedPlan(null);
      
      // Show success message
      alert(`Successfully upgraded to ${selectedPlan.name} plan!`);
    } catch (error: any) {
      setError(error.message || 'Failed to update plan');
    } finally {
      setUpdating(false);
    }
  };

  const openUpgradeModal = (plan: Plan) => {
    if (!team || plan.id === team.plan) return;
    setSelectedPlan(plan);
    setIsUpgradeOpen(true);
    setError('');
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

  const currentPlan = plans.find(p => p.id === team.plan) || plans[0];

  return (
    <DashboardLayout>
      <LoadingModal isOpen={dataLoading} message="Loading billing information..." />
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Billing & Plans</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your subscription and billing information
          </p>
        </div>

        {/* Current Plan Card */}
        <div className="card bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-200 dark:border-primary-800 animate-slide-up">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Current Plan</h2>
                <span className="badge badge-info">Active</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You're currently on the <span className="font-semibold text-gray-900 dark:text-white">{currentPlan.name}</span> plan
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">{currentPlan.price}</span>
                <span className="text-gray-600 dark:text-gray-400">/month</span>
              </div>
            </div>
            <div className="hidden md:block">
              <CreditCardIcon className="w-24 h-24 text-primary-400/50" />
            </div>
          </div>
        </div>

        {/* Usage Stats */}
        {usage && (
          <div className="card animate-slide-up" style={{ animationDelay: '100ms' }}>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Current Usage</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Monitors</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {usage.monitors || 0} / {currentPlan.id === 'free' ? '5' : currentPlan.id === 'pro' ? '50' : '∞'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status Pages</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {usage.status_pages || 0} / {currentPlan.id === 'free' ? '1' : '∞'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Pageviews (This Month)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {usage.pageviews || 0} / {currentPlan.id === 'free' ? '10,000' : currentPlan.id === 'pro' ? '100,000' : '∞'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Available Plans */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Available Plans</h2>
          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => {
              const isCurrent = plan.id === team.plan;
              return (
                <div
                  key={plan.id}
                  className={`card relative transition-all duration-200 hover:scale-105 animate-slide-up ${
                    plan.popular ? 'ring-2 ring-primary-500 shadow-xl' : ''
                  } ${isCurrent ? 'ring-2 ring-primary-600' : ''}`}
                  style={{ animationDelay: `${plans.indexOf(plan) * 100}ms` }}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="badge badge-info px-4 py-1">Most Popular</span>
                    </div>
                  )}
                  
                  {isCurrent && (
                    <div className="absolute top-4 right-4">
                      <span className="badge badge-success">Current</span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{plan.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{plan.description}</p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                      <span className="text-gray-600 dark:text-gray-400">/month</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature: string) => (
                      <li key={feature} className="flex items-start gap-3">
                        <CheckIcon className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => openUpgradeModal(plan)}
                    disabled={isCurrent}
                    className={`w-full ${
                      isCurrent
                        ? 'btn btn-secondary cursor-not-allowed'
                        : plan.popular
                        ? 'btn btn-primary'
                        : 'btn btn-secondary'
                    }`}
                  >
                    {isCurrent ? (
                      'Current Plan'
                    ) : plan.priceNum > currentPlan.priceNum ? (
                      <>
                        Upgrade <ArrowRightIcon className="w-5 h-5 ml-2 inline" />
                      </>
                    ) : (
                      'Switch Plan'
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Billing Information */}
        <div className="card animate-slide-up" style={{ animationDelay: '300ms' }}>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Billing Information</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Payment Method</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {team.plan === 'free' ? 'No payment method required' : 'Credit card on file'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Next Billing Date</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {team.plan === 'free' ? 'N/A' : team.plan_expires_at ? new Date(team.plan_expires_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
          {team.plan !== 'free' && (
            <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Note:</strong> Payment processing integration can be added with Stripe or Paddle. Plan changes are saved immediately.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Modal */}
      <Transition show={isUpgradeOpen} as={Fragment}>
        <Dialog onClose={() => setIsUpgradeOpen(false)} className="relative z-50">
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
                <Dialog.Title className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Upgrade to {selectedPlan?.name}
                </Dialog.Title>
                <Dialog.Description className="text-gray-600 dark:text-gray-400 mb-6">
                  {selectedPlan?.priceNum === 0 
                    ? 'Switch to the free plan. Plan changes take effect immediately.'
                    : `You'll be charged ${selectedPlan?.price}/month. Plan changes take effect immediately.`}
                </Dialog.Description>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 dark:text-gray-400">New Plan</span>
                      <span className="font-bold text-gray-900 dark:text-white">{selectedPlan?.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Monthly Cost</span>
                      <span className="font-bold text-gray-900 dark:text-white">{selectedPlan?.price}/month</span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setIsUpgradeOpen(false);
                        setSelectedPlan(null);
                        setError('');
                      }}
                      className="btn btn-secondary flex-1"
                      disabled={updating}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpgrade}
                      className="btn btn-primary flex-1"
                      disabled={updating}
                    >
                      {updating ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating...
                        </span>
                      ) : (
                        'Confirm Change'
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
