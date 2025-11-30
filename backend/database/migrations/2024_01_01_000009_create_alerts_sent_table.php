<?php

return [
    'up' => "
        CREATE TABLE alerts_sent (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            incident_id BIGINT UNSIGNED NOT NULL,
            notification_channel_id BIGINT UNSIGNED NOT NULL,
            status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
            error_message TEXT NULL,
            sent_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
            FOREIGN KEY (notification_channel_id) REFERENCES notification_channels(id) ON DELETE CASCADE,
            INDEX idx_incident_id (incident_id),
            INDEX idx_channel_id (notification_channel_id),
            INDEX idx_status (status),
            INDEX idx_sent_at (sent_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ",
    
    'down' => "DROP TABLE IF EXISTS alerts_sent;"
];
