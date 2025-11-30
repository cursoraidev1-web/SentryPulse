<?php

return [
    'up' => "
        CREATE TABLE api_keys (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            team_id BIGINT UNSIGNED NOT NULL,
            name VARCHAR(255) NOT NULL,
            key_hash VARCHAR(255) NOT NULL UNIQUE,
            key_prefix VARCHAR(20) NOT NULL,
            last_used_at TIMESTAMP NULL,
            expires_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
            INDEX idx_team_id (team_id),
            INDEX idx_key_hash (key_hash),
            INDEX idx_key_prefix (key_prefix)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ",
    
    'down' => "DROP TABLE IF EXISTS api_keys;"
];
