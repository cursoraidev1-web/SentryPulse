export class Team {
  constructor(data) {
    this.id = data.id;
    this.uuid = data.uuid;
    this.name = data.name;
    this.slug = data.slug;
    this.owner_id = data.owner_id;
    this.plan = data.plan || 'free';
    this.plan_expires_at = data.plan_expires_at || null;
    this.settings = typeof data.settings === 'string' ? JSON.parse(data.settings || 'null') : (data.settings || null);
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static fromArray(data) {
    return new Team(data);
  }

  toArray() {
    return {
      id: this.id,
      uuid: this.uuid,
      name: this.name,
      slug: this.slug,
      owner_id: this.owner_id,
      plan: this.plan,
      plan_expires_at: this.plan_expires_at,
      settings: this.settings,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}





