<?php

return [
    'up' => "
        CREATE TABLE events_raw (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            site_id BIGINT UNSIGNED NOT NULL,
            visitor_id VARCHAR(64) NOT NULL,
            session_id VARCHAR(64) NOT NULL,
            event_name VARCHAR(255) NOT NULL,
            properties JSON NULL,
            url VARCHAR(1000) NULL,
            occurred_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
            INDEX idx_site_id (site_id),
            INDEX idx_visitor_id (visitor_id),
            INDEX idx_session_id (session_id),
            INDEX idx_event_name (event_name),
            INDEX idx_occurred_at (occurred_at),
            INDEX idx_site_date (site_id, occurred_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ",
    
    'down' => "DROP TABLE IF EXISTS events_raw;"
];
