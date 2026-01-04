export class Incident {
  constructor(data) {
    this.id = data.id;
    this.monitor_id = data.monitor_id;
    this.title = data.title;
    this.description = data.description || null;
    this.status = data.status;
    this.severity = data.severity;
    this.started_at = data.started_at;
    this.resolved_at = data.resolved_at || null;
    this.duration_seconds = data.duration_seconds || null;
    this.metadata = typeof data.metadata === 'string' ? JSON.parse(data.metadata || 'null') : (data.metadata || null);
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static fromArray(data) {
    return new Incident(data);
  }

  toArray() {
    return {
      id: this.id,
      monitor_id: this.monitor_id,
      title: this.title,
      description: this.description,
      status: this.status,
      severity: this.severity,
      started_at: this.started_at,
      resolved_at: this.resolved_at,
      duration_seconds: this.duration_seconds,
      metadata: this.metadata,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}





