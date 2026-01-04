import axios from 'axios';
import { Resend } from 'resend';
import { db } from '../core/database.js';
import { env, now } from '../core/helpers.js';

export class NotificationService {
  constructor() {
    this.httpClient = axios.create({
      timeout: 10000
    });
    
    // Initialize Resend if API key is provided
    const resendApiKey = env('RESEND_API_KEY');
    if (resendApiKey) {
      this.resend = new Resend(resendApiKey);
    }
  }

  async sendIncidentAlert(incident) {
    const monitor = await this.getMonitor(incident.monitor_id);
    if (!monitor) {
      return;
    }

    const channels = await this.getTeamNotificationChannels(monitor.team_id);

    for (const channel of channels) {
      if (!channel.is_enabled) {
        continue;
      }

      await this.sendAlert(channel, incident, monitor, 'alert');
    }
  }

  async sendIncidentResolved(incident) {
    const monitor = await this.getMonitor(incident.monitor_id);
    if (!monitor) {
      return;
    }

    const channels = await this.getTeamNotificationChannels(monitor.team_id);

    for (const channel of channels) {
      if (!channel.is_enabled) {
        continue;
      }

      await this.sendAlert(channel, incident, monitor, 'resolved');
    }
  }

  async sendAlert(channel, incident, monitor, type) {
    const alertId = await db.insert(
      'INSERT INTO alerts_sent (incident_id, notification_channel_id, status) VALUES (?, ?, ?)',
      [incident.id, channel.id, 'pending']
    );

    try {
      const config = typeof channel.config === 'string' 
        ? JSON.parse(channel.config) 
        : channel.config;

      switch (channel.type) {
        case 'email':
          await this.sendEmailAlert(config, incident, monitor, type);
          break;

        case 'telegram':
          await this.sendTelegramAlert(config, incident, monitor, type);
          break;

        case 'webhook':
          await this.sendWebhookAlert(config, incident, monitor, type);
          break;

        case 'whatsapp':
          await this.sendWhatsAppAlert(config, incident, monitor, type);
          break;
      }

      await db.execute(
        'UPDATE alerts_sent SET status = ?, sent_at = ? WHERE id = ?',
        ['sent', now(), alertId]
      );

    } catch (error) {
      await db.execute(
        'UPDATE alerts_sent SET status = ?, error_message = ? WHERE id = ?',
        ['failed', error.message, alertId]
      );
    }
  }

  async sendEmailAlert(config, incident, monitor, type) {
    const email = config.email || config.to;
    if (!email) {
      throw new Error('Email address not provided in notification channel config');
    }

    const subject = type === 'alert' 
      ? `🚨 Alert: ${monitor.name} is down`
      : `✅ Resolved: ${monitor.name} is back up`;

    // Format duration for resolved alerts
    let durationText = '';
    if (type === 'resolved' && incident.duration_seconds) {
      const hours = Math.floor(incident.duration_seconds / 3600);
      const minutes = Math.floor((incident.duration_seconds % 3600) / 60);
      const seconds = incident.duration_seconds % 60;
      
      if (hours > 0) {
        durationText = `${hours}h ${minutes}m ${seconds}s`;
      } else if (minutes > 0) {
        durationText = `${minutes}m ${seconds}s`;
      } else {
        durationText = `${seconds}s`;
      }
    }

    const htmlBody = type === 'alert'
      ? `
        <h2>🚨 Monitor Alert</h2>
        <p>Your monitor <strong>${monitor.name}</strong> is currently down.</p>
        <ul>
          <li><strong>URL:</strong> <a href="${monitor.url}">${monitor.url}</a></li>
          <li><strong>Incident:</strong> ${incident.title}</li>
          <li><strong>Started at:</strong> ${new Date(incident.started_at).toLocaleString()}</li>
          ${incident.description ? `<li><strong>Description:</strong> ${incident.description}</li>` : ''}
        </ul>
        <p>Please check your monitor and resolve the issue.</p>
      `
      : `
        <h2>✅ Monitor Resolved</h2>
        <p>Your monitor <strong>${monitor.name}</strong> is back up.</p>
        <ul>
          <li><strong>URL:</strong> <a href="${monitor.url}">${monitor.url}</a></li>
          <li><strong>Incident:</strong> ${incident.title}</li>
          <li><strong>Duration:</strong> ${durationText}</li>
          <li><strong>Resolved at:</strong> ${new Date(incident.resolved_at || now()).toLocaleString()}</li>
        </ul>
        <p>Your monitor is now operational.</p>
      `;

    const textBody = type === 'alert'
      ? `Your monitor '${monitor.name}' (${monitor.url}) is currently down.\n\nIncident: ${incident.title}\n\nStarted at: ${incident.started_at}`
      : `Your monitor '${monitor.name}' (${monitor.url}) is back up.\n\nIncident duration: ${durationText}`;

    // Use Resend if available, otherwise fallback to SMTP or log
    if (this.resend) {
      const fromEmail = env('MAIL_FROM_ADDRESS') || env('RESEND_FROM_EMAIL') || 'noreply@sentrypulse.com';
      
      await this.resend.emails.send({
        from: fromEmail,
        to: email,
        subject: subject,
        html: htmlBody,
        text: textBody,
      });
    } else {
      // Fallback: Try SMTP if configured, otherwise log
      const smtpConfig = {
        host: env('SMTP_HOST'),
        port: parseInt(env('SMTP_PORT') || '587'),
        secure: env('SMTP_SECURE') === 'true',
        auth: {
          user: env('SMTP_USER'),
          pass: env('SMTP_PASSWORD'),
        },
      };

      if (smtpConfig.host && smtpConfig.auth.user) {
        // Use nodemailer if available (would need to add to package.json)
        // For now, log the email
        console.log(`[Email] To: ${email}\nSubject: ${subject}\n${textBody}`);
        throw new Error('SMTP email sending not yet implemented. Please configure RESEND_API_KEY or use SMTP.');
      } else {
        // Development fallback - just log
        console.log(`[Email Alert] To: ${email}\nSubject: ${subject}\n${textBody}`);
        console.warn('Email sending not configured. Set RESEND_API_KEY or SMTP settings to enable email notifications.');
      }
    }
  }

  async sendTelegramAlert(config, incident, monitor, type) {
    const token = env('TELEGRAM_BOT_TOKEN');
    if (!token) {
      throw new Error('Telegram bot token not configured');
    }

    const emoji = type === 'alert' ? '🚨' : '✅';
    const status = type === 'alert' ? 'DOWN' : 'UP';

    let message = `${emoji} *${status}*: ${monitor.name}\n\n`;
    message += `URL: ${monitor.url}\n`;
    message += `Incident: ${incident.title}\n`;
    message += `Time: ${incident.started_at}`;

    await this.httpClient.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: config.chat_id,
      text: message,
      parse_mode: 'Markdown'
    });
  }

  async sendWebhookAlert(config, incident, monitor, type) {
    const payload = {
      type: type,
      monitor: {
        id: monitor.id,
        name: monitor.name,
        url: monitor.url,
        status: monitor.status
      },
      incident: incident.toArray ? incident.toArray() : incident,
      timestamp: now()
    };

    const headers = config.headers || {};
    
    await this.httpClient.post(config.url, payload, { headers });
  }

  async sendWhatsAppAlert(config, incident, monitor, type) {
    const apiUrl = env('WHATSAPP_API_URL');
    const apiKey = env('WHATSAPP_API_KEY');

    if (!apiUrl || !apiKey) {
      throw new Error('WhatsApp API not configured');
    }

    const emoji = type === 'alert' ? '🚨' : '✅';
    const status = type === 'alert' ? 'DOWN' : 'UP';

    let message = `${emoji} *${status}*: ${monitor.name}\n\n`;
    message += `URL: ${monitor.url}\n`;
    message += `Incident: ${incident.title}\n`;
    message += `Time: ${incident.started_at}`;

    await this.httpClient.post(apiUrl, {
      to: config.phone_number,
      message: message
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
  }

  async getMonitor(monitorId) {
    return await db.queryOne('SELECT * FROM monitors WHERE id = ?', [monitorId]);
  }

  async getTeamNotificationChannels(teamId) {
    return await db.query(
      'SELECT * FROM notification_channels WHERE team_id = ? AND is_enabled = TRUE',
      [teamId]
    );
  }
}

