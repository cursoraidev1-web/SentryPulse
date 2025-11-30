<?php

return [
    'up' => "
        CREATE TABLE teams (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            uuid VARCHAR(36) NOT NULL UNIQUE,
            name VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL UNIQUE,
            owner_id BIGINT UNSIGNED NOT NULL,
            plan VARCHAR(50) DEFAULT 'free',
            plan_expires_at TIMESTAMP NULL,
            settings JSON NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_owner_id (owner_id),
            INDEX idx_slug (slug),
            INDEX idx_plan (plan)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ",
    
    'down' => "DROP TABLE IF EXISTS teams;"
];
