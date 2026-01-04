export class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.email_verified_at = data.email_verified_at || null;
    this.password = data.password;
    this.avatar = data.avatar || null;
    this.timezone = data.timezone || 'UTC';
    this.last_login_at = data.last_login_at || null;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static fromArray(data) {
    return new User(data);
  }

  toArray() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      avatar: this.avatar,
      timezone: this.timezone,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}





