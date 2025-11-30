<?php

return [
    'up' => "
        CREATE TABLE sites (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            team_id BIGINT UNSIGNED NOT NULL,
            name VARCHAR(255) NOT NULL,
            domain VARCHAR(255) NOT NULL,
            tracking_code VARCHAR(50) NOT NULL UNIQUE,
            is_enabled BOOLEAN DEFAULT TRUE,
            timezone VARCHAR(50) DEFAULT 'UTC',
            public_stats BOOLEAN DEFAULT FALSE,
            settings JSON NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
            INDEX idx_team_id (team_id),
            INDEX idx_tracking_code (tracking_code),
            INDEX idx_domain (domain),
            INDEX idx_is_enabled (is_enabled)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ",
    
    'down' => "DROP TABLE IF EXISTS sites;"
];
