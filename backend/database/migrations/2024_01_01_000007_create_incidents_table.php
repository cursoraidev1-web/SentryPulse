<?php

return [
    'up' => "
        CREATE TABLE incidents (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            monitor_id BIGINT UNSIGNED NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT NULL,
            status ENUM('investigating', 'identified', 'monitoring', 'resolved') DEFAULT 'investigating',
            severity ENUM('critical', 'major', 'minor') DEFAULT 'major',
            started_at TIMESTAMP NOT NULL,
            resolved_at TIMESTAMP NULL,
            duration_seconds INT UNSIGNED NULL,
            metadata JSON NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (monitor_id) REFERENCES monitors(id) ON DELETE CASCADE,
            INDEX idx_monitor_id (monitor_id),
            INDEX idx_status (status),
            INDEX idx_severity (severity),
            INDEX idx_started_at (started_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ",
    
    'down' => "DROP TABLE IF EXISTS incidents;"
];
