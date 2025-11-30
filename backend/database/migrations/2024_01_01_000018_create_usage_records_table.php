<?php

return [
    'up' => "
        CREATE TABLE usage_records (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            team_id BIGINT UNSIGNED NOT NULL,
            resource_type VARCHAR(50) NOT NULL COMMENT 'monitors, pageviews, api_calls, etc',
            usage_count INT UNSIGNED NOT NULL DEFAULT 0,
            period_start DATE NOT NULL,
            period_end DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
            INDEX idx_team_id (team_id),
            INDEX idx_resource_type (resource_type),
            INDEX idx_period (period_start, period_end),
            UNIQUE KEY unique_team_resource_period (team_id, resource_type, period_start, period_end)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ",
    
    'down' => "DROP TABLE IF EXISTS usage_records;"
];
