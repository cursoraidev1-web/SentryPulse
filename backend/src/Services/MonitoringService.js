import axios from 'axios';
import https from 'https';
import { MonitorRepository } from '../repositories/MonitorRepository.js';
import { IncidentRepository } from '../repositories/IncidentRepository.js';
import { NotificationService } from './NotificationService.js';
import { now } from '../core/helpers.js';

export class MonitoringService {
  constructor() {
    this.monitorRepository = new MonitorRepository();
    this.incidentRepository = new IncidentRepository();
    this.notificationService = new NotificationService();
    this.httpClient = axios.create({
      timeout: 30000,
      maxRedirects: 5,
      validateStatus: () => true
    });
  }

  async checkMonitor(monitor) {
    const startTime = Date.now();
    const result = {
      status: 'success',
      status_code: null,
      response_time: null,
      error_message: null,
      ssl_valid: null,
      ssl_expires_at: null,
      dns_resolved: null,
      keyword_found: null,
      monitor_status: 'up'
    };

    try {
      const options = {
        method: monitor.method,
        url: monitor.url,
        timeout: monitor.timeout * 1000,
        headers: monitor.headers || {}
      };

      if (monitor.method === 'POST' && monitor.body) {
        options.data = monitor.body;
      }

      const response = await this.httpClient.request(options);

      const endTime = Date.now();
      result.response_time = endTime - startTime;
      result.status_code = response.status;

      if (result.status_code !== monitor.expected_status_code) {
        result.status = 'failure';
        result.monitor_status = 'down';
        result.error_message = `Expected status ${monitor.expected_status_code}, got ${result.status_code}`;
      }

      if (monitor.check_keyword) {
        const body = typeof response.data === 'string' 
          ? response.data 
          : JSON.stringify(response.data);
        result.keyword_found = body.includes(monitor.check_keyword);

        if (!result.keyword_found) {
          result.status = 'failure';
          result.monitor_status = 'down';
          result.error_message = `Keyword '${monitor.check_keyword}' not found`;
        }
      }

      if (monitor.check_ssl && monitor.url.startsWith('https://')) {
        const sslInfo = await this.checkSSL(monitor.url);
        result.ssl_valid = sslInfo.valid;
        result.ssl_expires_at = sslInfo.expires_at;

        if (!sslInfo.valid) {
          result.status = 'failure';
          result.monitor_status = 'down';
          result.error_message = sslInfo.error || 'SSL certificate invalid';
        }
      }

      result.dns_resolved = true;

    } catch (error) {
      result.status = 'failure';
      result.monitor_status = 'down';
      result.error_message = error.message;

      if (error.response) {
        result.status_code = error.response.status;
      }
    }

    await this.monitorRepository.createCheck(monitor.id, result);
    await this.monitorRepository.updateCheckResult(monitor.id, result);
    await this.monitorRepository.updateUptimePercentage(monitor.id);

    await this.handleIncident(monitor, result);

    return result;
  }

  async checkSSL(url) {
    const result = {
      valid: false,
      expires_at: null,
      error: null
    };

    try {
      const urlObj = new URL(url);
      const host = urlObj.hostname;
      const port = urlObj.port || 443;

      return new Promise((resolve) => {
        const socket = https.connect({ host, port, rejectUnauthorized: false }, () => {
          const cert = socket.getPeerCertificate(true);

          if (cert) {
            result.valid = true;
            result.expires_at = new Date(cert.valid_to).toISOString().slice(0, 19).replace('T', ' ');

            if (new Date(cert.valid_to) < new Date()) {
              result.valid = false;
              result.error = 'Certificate expired';
            }
          } else {
            result.error = 'Could not get certificate';
          }

          socket.end();
          resolve(result);
        });

        socket.on('error', (err) => {
          result.error = err.message;
          resolve(result);
        });

        socket.setTimeout(10000, () => {
          socket.destroy();
          result.error = 'SSL check timeout';
          resolve(result);
        });
      });
    } catch (error) {
      result.error = error.message;
      return result;
    }
  }

  async handleIncident(monitor, checkResult) {
    const activeIncident = await this.incidentRepository.findActiveByMonitor(monitor.id);

    if (checkResult.monitor_status === 'down') {
      if (!activeIncident) {
        const incident = await this.incidentRepository.create({
          monitor_id: monitor.id,
          title: `${monitor.name} is down`,
          description: checkResult.error_message || 'Monitor check failed',
          status: 'investigating',
          severity: 'major',
          started_at: now(),
          metadata: {
            check_result: checkResult
          }
        });

        await this.notificationService.sendIncidentAlert(incident);
      }
    } else {
      if (activeIncident) {
        await this.incidentRepository.resolve(activeIncident.id);

        await this.notificationService.sendIncidentResolved(activeIncident);
      }
    }
  }

  async runAllChecks() {
    const monitors = await this.monitorRepository.findEnabled();
    const results = {};

    for (const monitor of monitors) {
      if (await this.shouldCheck(monitor)) {
        results[monitor.id] = await this.checkMonitor(monitor);
      }
    }

    return results;
  }

  async shouldCheck(monitor) {
    if (!monitor.last_checked_at) {
      return true;
    }

    const lastChecked = new Date(monitor.last_checked_at).getTime();
    const nextCheck = lastChecked + (monitor.interval * 1000);

    return Date.now() >= nextCheck;
  }
}





