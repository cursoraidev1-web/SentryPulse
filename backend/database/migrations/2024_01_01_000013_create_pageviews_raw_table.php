<?php

return [
    'up' => "
        CREATE TABLE pageviews_raw (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            site_id BIGINT UNSIGNED NOT NULL,
            visitor_id VARCHAR(64) NOT NULL COMMENT 'Hashed visitor identifier',
            session_id VARCHAR(64) NOT NULL,
            url VARCHAR(1000) NOT NULL,
            referrer VARCHAR(1000) NULL,
            utm_source VARCHAR(255) NULL,
            utm_medium VARCHAR(255) NULL,
            utm_campaign VARCHAR(255) NULL,
            browser VARCHAR(100) NULL,
            os VARCHAR(100) NULL,
            device_type ENUM('desktop', 'mobile', 'tablet') NULL,
            country_code CHAR(2) NULL,
            screen_width INT UNSIGNED NULL,
            screen_height INT UNSIGNED NULL,
            viewed_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
            INDEX idx_site_id (site_id),
            INDEX idx_visitor_id (visitor_id),
            INDEX idx_session_id (session_id),
            INDEX idx_viewed_at (viewed_at),
            INDEX idx_site_date (site_id, viewed_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ",
    
    'down' => "DROP TABLE IF EXISTS pageviews_raw;"
];
