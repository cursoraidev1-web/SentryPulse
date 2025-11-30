<?php

return [
    'up' => "
        CREATE TABLE notification_channels (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            team_id BIGINT UNSIGNED NOT NULL,
            name VARCHAR(255) NOT NULL,
            type ENUM('email', 'whatsapp', 'telegram', 'webhook') NOT NULL,
            is_enabled BOOLEAN DEFAULT TRUE,
            config JSON NOT NULL COMMENT 'Channel-specific configuration',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
            INDEX idx_team_id (team_id),
            INDEX idx_type (type),
            INDEX idx_is_enabled (is_enabled)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ",
    
    'down' => "DROP TABLE IF EXISTS notification_channels;"
];
