<?php

return [
    'up' => "
        CREATE TABLE monitors (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            team_id BIGINT UNSIGNED NOT NULL,
            name VARCHAR(255) NOT NULL,
            url VARCHAR(500) NOT NULL,
            type ENUM('http', 'https', 'ping', 'dns') DEFAULT 'https',
            method ENUM('GET', 'POST', 'HEAD') DEFAULT 'GET',
            interval INT UNSIGNED DEFAULT 60 COMMENT 'Check interval in seconds',
            timeout INT UNSIGNED DEFAULT 30 COMMENT 'Timeout in seconds',
            status ENUM('up', 'down', 'paused') DEFAULT 'up',
            is_enabled BOOLEAN DEFAULT TRUE,
            check_ssl BOOLEAN DEFAULT TRUE,
            check_keyword VARCHAR(255) NULL,
            expected_status_code INT UNSIGNED DEFAULT 200,
            headers JSON NULL,
            body TEXT NULL,
            last_checked_at TIMESTAMP NULL,
            last_status VARCHAR(20) NULL,
            last_response_time INT UNSIGNED NULL COMMENT 'Response time in ms',
            uptime_percentage DECIMAL(5, 2) DEFAULT 100.00,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
            INDEX idx_team_id (team_id),
            INDEX idx_status (status),
            INDEX idx_is_enabled (is_enabled),
            INDEX idx_last_checked_at (last_checked_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ",
    
    'down' => "DROP TABLE IF EXISTS monitors;"
];
