export class Site {
  constructor(data) {
    this.id = data.id;
    this.team_id = data.team_id;
    this.name = data.name;
    this.domain = data.domain;
    this.tracking_code = data.tracking_code;
    this.is_enabled = data.is_enabled !== undefined ? Boolean(data.is_enabled) : true;
    this.timezone = data.timezone || 'UTC';
    this.public_stats = data.public_stats !== undefined ? Boolean(data.public_stats) : false;
    this.settings = typeof data.settings === 'string' ? JSON.parse(data.settings || 'null') : (data.settings || null);
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static fromArray(data) {
    return new Site(data);
  }

  toArray() {
    return {
      id: this.id,
      team_id: this.team_id,
      name: this.name,
      domain: this.domain,
      tracking_code: this.tracking_code,
      is_enabled: this.is_enabled,
      timezone: this.timezone,
      public_stats: this.public_stats,
      settings: this.settings,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}





