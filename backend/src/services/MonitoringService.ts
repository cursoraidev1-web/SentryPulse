import axios from 'axios';
import https from 'https';
import { MonitorRepository } from '../repositories/MonitorRepository';
import { Monitor } from '../models/types';

export class MonitoringService {
  private monitorRepository: MonitorRepository;

  constructor() {
    this.monitorRepository = new MonitorRepository();
  }

  async checkMonitor(monitor: Monitor): Promise<any> {
    const startTime = Date.now();
    const result: any = {
      status: 'success',
      status_code: null,
      response_time: null,
      error_message: null,
      ssl_valid: null,
      ssl_expires_at: null,
      dns_resolved: null,
      keyword_found: null,
      monitor_status: 'up',
    };

    try {
      const options: any = {
        method: monitor.method,
        url: monitor.url,
        timeout: monitor.timeout * 1000,
        headers: monitor.headers || {},
        validateStatus: () => true, // Don't throw on any status code
      };

      if (monitor.method === 'POST' && monitor.body) {
        options.data = monitor.body;
      }

      const response = await axios(options);

      const endTime = Date.now();
      result.response_time = endTime - startTime;
      result.status_code = response.status;

      if (result.status_code !== monitor.expected_status_code) {
        result.status = 'failure';
        result.monitor_status = 'down';
        result.error_message = `Expected status ${monitor.expected_status_code}, got ${result.status_code}`;
      }

      if (monitor.check_keyword && response.data) {
        const body = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
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

    } catch (error: any) {
      result.status = 'failure';
      result.monitor_status = 'down';
      result.error_message = error.message;

      if (error.response) {
        result.status_code = error.response.status;
      }
    }

    await this.monitorRepository.createCheck(monitor.id, result);
    await this.monitorRepository.updateCheckResult(monitor.id, result);

    return result;
  }

  private async checkSSL(url: string): Promise<any> {
    return new Promise((resolve) => {
      try {
        const urlObj = new URL(url);
        const options = {
          host: urlObj.hostname,
          port: 443,
          method: 'GET',
        };

        const req = https.request(options, (res) => {
          const cert = (res.socket as any).getPeerCertificate();

          if (!cert || Object.keys(cert).length === 0) {
            resolve({ valid: false, expires_at: null, error: 'No certificate' });
            return;
          }

          const validTo = new Date(cert.valid_to);
          const now = new Date();

          resolve({
            valid: validTo > now,
            expires_at: validTo.toISOString().slice(0, 19).replace('T', ' '),
            error: validTo <= now ? 'Certificate expired' : null,
          });
        });

        req.on('error', (error) => {
          resolve({ valid: false, expires_at: null, error: error.message });
        });

        req.end();
      } catch (error: any) {
        resolve({ valid: false, expires_at: null, error: error.message });
      }
    });
  }

  async runAllChecks(): Promise<any> {
    const monitors = await this.monitorRepository.findEnabled();
    const results: any = {};

    for (const monitor of monitors) {
      if (this.shouldCheck(monitor)) {
        results[monitor.id] = await this.checkMonitor(monitor);
      }
    }

    return results;
  }

  private shouldCheck(monitor: Monitor): boolean {
    if (!monitor.last_checked_at) {
      return true;
    }

    const lastChecked = new Date(monitor.last_checked_at).getTime();
    const nextCheck = lastChecked + monitor.interval * 1000;

    return Date.now() >= nextCheck;
  }
}
