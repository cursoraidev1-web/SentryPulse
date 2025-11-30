<?php

return [
    'up' => "
        CREATE TABLE monitor_checks (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            monitor_id BIGINT UNSIGNED NOT NULL,
            status ENUM('success', 'failure', 'timeout', 'error') NOT NULL,
            status_code INT UNSIGNED NULL,
            response_time INT UNSIGNED NULL COMMENT 'Response time in ms',
            error_message TEXT NULL,
            ssl_valid BOOLEAN NULL,
            ssl_expires_at TIMESTAMP NULL,
            dns_resolved BOOLEAN NULL,
            keyword_found BOOLEAN NULL,
            checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (monitor_id) REFERENCES monitors(id) ON DELETE CASCADE,
            INDEX idx_monitor_id (monitor_id),
            INDEX idx_status (status),
            INDEX idx_checked_at (checked_at),
            INDEX idx_monitor_checked (monitor_id, checked_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ",
    
    'down' => "DROP TABLE IF EXISTS monitor_checks;"
];
