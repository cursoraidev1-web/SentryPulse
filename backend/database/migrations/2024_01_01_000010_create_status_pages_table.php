<?php

return [
    'up' => "
        CREATE TABLE status_pages (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            team_id BIGINT UNSIGNED NOT NULL,
            name VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL UNIQUE,
            domain VARCHAR(255) NULL,
            logo_url VARCHAR(500) NULL,
            is_public BOOLEAN DEFAULT TRUE,
            theme JSON NULL,
            custom_css TEXT NULL,
            custom_html TEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
            INDEX idx_team_id (team_id),
            INDEX idx_slug (slug),
            INDEX idx_is_public (is_public)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ",
    
    'down' => "DROP TABLE IF EXISTS status_pages;"
];
