const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface RequestOptions extends RequestInit {
  token?: string;
}

async function fetcher<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(typeof fetchOptions.headers === 'object' && !(fetchOptions.headers instanceof Headers)
      ? (fetchOptions.headers as Record<string, string>)
      : {}),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
}

export const api = {
  auth: {
    register: (data: { name: string; email: string; password: string }) =>
      fetcher('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    login: (email: string, password: string) =>
      fetcher('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    me: (token: string) =>
      fetcher('/auth/me', { token }),

    updateProfile: (token: string, data: any) =>
      fetcher('/auth/profile', {
        method: 'PUT',
        token,
        body: JSON.stringify(data),
      }),
  },

  teams: {
    list: (token: string) =>
      fetcher('/teams', { token }),

    get: (token: string, id: number) =>
      fetcher(`/teams/${id}`, { token }),

    create: (token: string, data: { name: string; plan?: string }) =>
      fetcher('/teams', {
        method: 'POST',
        token,
        body: JSON.stringify(data),
      }),

    update: (token: string, id: number, data: any) =>
      fetcher(`/teams/${id}`, {
        method: 'PUT',
        token,
        body: JSON.stringify(data),
      }),

    addMember: (token: string, teamId: number, email: string, role: string = 'member') =>
      fetcher(`/teams/${teamId}/members`, {
        method: 'POST',
        token,
        body: JSON.stringify({ email, role }),
      }),

    removeMember: (token: string, teamId: number, userId: number) =>
      fetcher(`/teams/${teamId}/members/${userId}`, {
        method: 'DELETE',
        token,
      }),
  },
  
  monitors: {
    list: (token: string, teamId: number) =>
      fetcher(`/monitors?team_id=${teamId}`, { token }),

    get: (token: string, id: number) =>
      fetcher(`/monitors/${id}`, { token }),

    create: (token: string, data: any) =>
      fetcher('/monitors', {
        method: 'POST',
        token,
        body: JSON.stringify(data),
      }),

    update: (token: string, id: number, data: any) =>
      fetcher(`/monitors/${id}`, {
        method: 'PUT',
        token,
        body: JSON.stringify(data),
      }),

    delete: (token: string, id: number) =>
      fetcher(`/monitors/${id}`, {
        method: 'DELETE',
        token,
      }),

    checks: (token: string, id: number, limit = 100) =>
      fetcher(`/monitors/${id}/checks?limit=${limit}`, { token }),

    runCheck: (token: string, id: number) =>
      fetcher(`/monitors/${id}/check`, {
        method: 'POST',
        token,
      }),
  },

  incidents: {
    list: (token: string, teamId: number, status?: string) =>
      fetcher(`/incidents?team_id=${teamId}${status ? `&status=${status}` : ''}`, { token }),

    get: (token: string, id: number) =>
      fetcher(`/incidents/${id}`, { token }),

    update: (token: string, id: number, data: any) =>
      fetcher(`/incidents/${id}`, {
        method: 'PUT',
        token,
        body: JSON.stringify(data),
      }),

    resolve: (token: string, id: number) =>
      fetcher(`/incidents/${id}/resolve`, {
        method: 'POST',
        token,
      }),
  },

  statusPages: {
    list: (token: string, teamId: number) =>
      fetcher(`/status-pages?team_id=${teamId}`, { token }),

    get: (token: string, id: number) =>
      fetcher(`/status-pages/${id}`, { token }),

    getBySlug: (slug: string) =>
      fetcher(`/status/${slug}`),

    create: (token: string, data: any) =>
      fetcher('/status-pages', {
        method: 'POST',
        token,
        body: JSON.stringify(data),
      }),

    update: (token: string, id: number, data: any) =>
      fetcher(`/status-pages/${id}`, {
        method: 'PUT',
        token,
        body: JSON.stringify(data),
      }),

    delete: (token: string, id: number) =>
      fetcher(`/status-pages/${id}`, {
        method: 'DELETE',
        token,
      }),

    addMonitor: (token: string, statusPageId: number, monitorId: number) =>
      fetcher(`/status-pages/${statusPageId}/monitors`, {
        method: 'POST',
        token,
        body: JSON.stringify({ monitor_id: monitorId }),
      }),

    removeMonitor: (token: string, statusPageId: number, monitorId: number) =>
      fetcher(`/status-pages/${statusPageId}/monitors/${monitorId}`, {
        method: 'DELETE',
        token,
      }),
  },

  analytics: {
    sites: {
      list: (token: string, teamId: number) =>
        fetcher(`/analytics/sites?team_id=${teamId}`, { token }),

      // <--- THIS IS THE FIX ---
      // We use 'site' (singular) here to match the backend route: router.get('/analytics/site/:id')
      get: (token: string, id: number) =>
        fetcher(`/analytics/site/${id}`, { token }),
      // -----------------------

      create: (token: string, data: any) =>
        fetcher('/analytics/sites', {
          method: 'POST',
          token,
          body: JSON.stringify(data),
        }),

      update: (token: string, id: number, data: any) =>
        fetcher(`/analytics/sites/${id}`, {
          method: 'PUT',
          token,
          body: JSON.stringify(data),
        }),

      delete: (token: string, id: number) =>
        fetcher(`/analytics/sites/${id}`, {
          method: 'DELETE',
          token,
        }),

      stats: (token: string, id: number, startDate: string, endDate: string) =>
        fetcher(`/analytics/sites/${id}/stats?start_date=${startDate}&end_date=${endDate}`, { token }),
    },
  },
};