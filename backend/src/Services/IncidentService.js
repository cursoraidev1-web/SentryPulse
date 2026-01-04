import { IncidentRepository } from '../repositories/IncidentRepository.js';

export class IncidentService {
  constructor() {
    this.incidentRepository = new IncidentRepository();
  }

  async getIncident(id) {
    return await this.incidentRepository.findById(id);
  }

  async getTeamIncidents(teamId, status = null, limit = 100) {
    return await this.incidentRepository.findByTeam(teamId, status, limit);
  }

  async getMonitorIncidents(monitorId, limit = 50) {
    return await this.incidentRepository.findByMonitor(monitorId, limit);
  }

  async createIncident(data) {
    return await this.incidentRepository.create(data);
  }

  async updateIncident(id, data) {
    await this.incidentRepository.update(id, data);
    return await this.incidentRepository.findById(id);
  }

  async resolveIncident(id) {
    await this.incidentRepository.resolve(id);
    return await this.incidentRepository.findById(id);
  }

  async deleteIncident(id) {
    return await this.incidentRepository.delete(id);
  }

  async getActiveIncident(monitorId) {
    return await this.incidentRepository.findActiveByMonitor(monitorId);
  }
}





