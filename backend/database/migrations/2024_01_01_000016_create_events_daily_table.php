<?php

return [
    'up' => "
        CREATE TABLE events_daily (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            site_id BIGINT UNSIGNED NOT NULL,
            event_name VARCHAR(255) NOT NULL,
            date DATE NOT NULL,
            count INT UNSIGNED DEFAULT 0,
            unique_users INT UNSIGNED DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
            UNIQUE KEY unique_site_event_date (site_id, event_name, date),
            INDEX idx_site_id (site_id),
            INDEX idx_event_name (event_name),
            INDEX idx_date (date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ",
    
    'down' => "DROP TABLE IF EXISTS events_daily;"
];
