<?php

return [
    'up' => "
        CREATE TABLE team_users (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            team_id BIGINT UNSIGNED NOT NULL,
            user_id BIGINT UNSIGNED NOT NULL,
            role ENUM('owner', 'admin', 'member') DEFAULT 'member',
            invited_by BIGINT UNSIGNED NULL,
            joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE SET NULL,
            UNIQUE KEY unique_team_user (team_id, user_id),
            INDEX idx_team_id (team_id),
            INDEX idx_user_id (user_id),
            INDEX idx_role (role)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ",
    
    'down' => "DROP TABLE IF EXISTS team_users;"
];
