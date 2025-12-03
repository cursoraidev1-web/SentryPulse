export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  password: string;
  avatar: string | null;
  timezone: string;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  owner_id: number;
  plan: string;
  plan_expires_at: string | null;
  settings: any;
  created_at: string;
  updated_at: string;
}

export interface Monitor {
  id: number;
  team_id: number;
  name: string;
  url: string;
  type: 'http' | 'https' | 'ping' | 'dns';
  method: 'GET' | 'POST' | 'HEAD';
  interval: number;
  timeout: number;
  status: 'up' | 'down' | 'paused';
  is_enabled: boolean;
  check_ssl: boolean;
  check_keyword: string | null;
  expected_status_code: number;
  headers: any;
  body: string | null;
  last_checked_at: string | null;
  last_status: string | null;
  last_response_time: number | null;
  uptime_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface Incident {
  id: number;
  monitor_id: number;
  title: string;
  description: string | null;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  severity: 'critical' | 'major' | 'minor';
  started_at: string;
  resolved_at: string | null;
  duration_seconds: number | null;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface Site {
  id: number;
  team_id: number;
  name: string;
  domain: string;
  tracking_code: string;
  is_enabled: boolean;
  timezone: string;
  public_stats: boolean;
  settings: any;
  created_at: string;
  updated_at: string;
}
