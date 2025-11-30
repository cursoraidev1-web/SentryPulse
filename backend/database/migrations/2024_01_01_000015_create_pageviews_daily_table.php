<?php

return [
    'up' => "
        CREATE TABLE pageviews_daily (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            site_id BIGINT UNSIGNED NOT NULL,
            date DATE NOT NULL,
            pageviews INT UNSIGNED DEFAULT 0,
            unique_visitors INT UNSIGNED DEFAULT 0,
            sessions INT UNSIGNED DEFAULT 0,
            bounce_rate DECIMAL(5, 2) DEFAULT 0.00,
            avg_session_duration INT UNSIGNED DEFAULT 0 COMMENT 'In seconds',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
            UNIQUE KEY unique_site_date (site_id, date),
            INDEX idx_site_id (site_id),
            INDEX idx_date (date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ",
    
    'down' => "DROP TABLE IF EXISTS pageviews_daily;"
];
