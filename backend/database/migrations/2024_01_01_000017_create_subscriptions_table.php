<?php

return [
    'up' => "
        CREATE TABLE subscriptions (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            team_id BIGINT UNSIGNED NOT NULL,
            plan VARCHAR(50) NOT NULL,
            status ENUM('active', 'cancelled', 'expired', 'trial') DEFAULT 'trial',
            trial_ends_at TIMESTAMP NULL,
            started_at TIMESTAMP NOT NULL,
            ends_at TIMESTAMP NULL,
            billing_cycle ENUM('monthly', 'yearly') DEFAULT 'monthly',
            amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
            currency VARCHAR(3) DEFAULT 'USD',
            payment_provider VARCHAR(50) NULL,
            payment_provider_id VARCHAR(255) NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
            INDEX idx_team_id (team_id),
            INDEX idx_status (status),
            INDEX idx_plan (plan)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ",
    
    'down' => "DROP TABLE IF EXISTS subscriptions;"
];
