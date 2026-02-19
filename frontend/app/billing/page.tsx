'use client';

import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuth } from '@/lib/hooks/useAuth';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import { CheckIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const plans = [
  {
    name: 'Free',
    price: '$0',
    features: [
      '5 monitors',
      '1 status page',
      '10,000 pageviews/month',
      'Email notifications',
      '24-hour data retention',
    ],
  },
  {
    name: 'Pro',
    price: '$29',
    features: [
      '50 monitors',
      'Unlimited status pages',
      '100,000 pageviews/month',
      'All notification channels',
      '90-day data retention',
      'API access',
    ],
  },
  {
    name: 'Business',
    price: '$99',
    features: [
      'Unlimited monitors',
      'Unlimited status pages',
      'Unlimited pageviews',
      'All notification channels',
      '1-year data retention',
      'API access',
      'Priority support',
      'Custom domains',
    ],
  },
];

export default function BillingPage() {
  const { user, loading } = useAuth(true);
  const [team, setTeam] = useState<any>(null);
  const [updatingPlan, setUpdatingPlan] = useState<string | null>(null);

  const loadTeam = useCallback(async () => {
    const token = auth.getToken();
    if (!token) return;
    try {
      const teamsResponse: any = await api.teams.list(token);
      const teams = Array.isArray(teamsResponse.data) ? teamsResponse.data : (teamsResponse.data?.teams || []);
      if (teams.length > 0) setTeam(teams[0]);
    } catch (error) {
      console.error('Failed to load team:', error);
    }
  }, []);

  useEffect(() => {
    if (!loading && user) loadTeam();
  }, [loading, user, loadTeam]);

  const changePlan = async (planName: string) => {
    const token = auth.getToken();
    if (!token || !team) return;
    const planValue = planName.toLowerCase();
    if (planValue === (team.plan || 'free')) return;
    setUpdatingPlan(planName);
    try {
      await api.teams.update(token, team.id, { plan: planValue });
      toast.success(`Plan updated to ${planName}`);
      await loadTeam();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update plan');
    } finally {
      setUpdatingPlan(null);
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Billing & Plans</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your subscription and billing
          </p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Current Plan</h2>
          <div className="flex items-center space-x-4">
            <span className="text-2xl font-bold text-primary-600 uppercase">{team.plan}</span>
            {team.plan !== 'free' && (
              <button className="btn btn-secondary text-sm">Manage Subscription</button>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Available Plans</h2>
          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => {
              const isCurrent = plan.name.toLowerCase() === team.plan;
              return (
                <div
                  key={plan.name}
                  className={`card ${
                    isCurrent ? 'ring-2 ring-primary-600' : ''
                  }`}
                >
                  {isCurrent && (
                    <div className="mb-4">
                      <span className="px-3 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 rounded-full text-sm font-semibold">
                        Current Plan
                      </span>
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                  <p className="mt-4">
                    <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{plan.price}</span>
                    <span className="text-base font-medium text-gray-500 dark:text-gray-400">/month</span>
                  </p>
                  <ul className="mt-6 space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex">
                        <CheckIcon className="flex-shrink-0 w-6 h-6 text-green-500" />
                        <span className="ml-3 text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`mt-8 w-full ${
                      isCurrent ? 'btn btn-secondary' : 'btn btn-primary'
                    }`}
                    disabled={isCurrent || updatingPlan !== null}
                    onClick={() => !isCurrent && changePlan(plan.name)}
                  >
                    {isCurrent
                      ? 'Current Plan'
                      : updatingPlan === plan.name
                        ? 'Updating…'
                        : plan.name === 'Free'
                          ? 'Switch to Free'
                          : 'Upgrade'}
                  </button>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Plan changes take effect immediately. To collect payments (e.g. Stripe), add a checkout flow and then call the same team update API with the new plan after successful payment.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
