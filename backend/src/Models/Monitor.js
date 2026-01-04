export class Monitor {
  constructor(data) {
    this.id = data.id;
    this.team_id = data.team_id;
    this.name = data.name;
    this.url = data.url;
    this.type = data.type || 'https';
    this.method = data.method || 'GET';
    this.interval = data.interval || 60;
    this.timeout = data.timeout || 30;
    this.status = data.status || 'unknown';
    this.is_enabled = data.is_enabled !== undefined ? Boolean(data.is_enabled) : true;
    this.check_ssl = data.check_ssl !== undefined ? Boolean(data.check_ssl) : true;
    this.check_keyword = data.check_keyword || null;
    this.expected_status_code = data.expected_status_code || 200;
    this.headers = typeof data.headers === 'string' ? JSON.parse(data.headers || 'null') : (data.headers || null);
    this.body = data.body || null;
    this.last_checked_at = data.last_checked_at || null;
    this.last_status = data.last_status || null;
    this.last_response_time = data.last_response_time || null;
    this.uptime_percentage = parseFloat(data.uptime_percentage || 0);
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static fromArray(data) {
    return new Monitor(data);
  }

  toArray() {
    return {
      id: this.id,
      team_id: this.team_id,
      name: this.name,
      url: this.url,
      type: this.type,
      method: this.method,
      interval: this.interval,
      timeout: this.timeout,
      status: this.status,
      is_enabled: this.is_enabled,
      check_ssl: this.check_ssl,
      check_keyword: this.check_keyword,
      expected_status_code: this.expected_status_code,
      headers: this.headers,
      body: this.body,
      last_checked_at: this.last_checked_at,
      last_status: this.last_status,
      last_response_time: this.last_response_time,
      uptime_percentage: this.uptime_percentage,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}





