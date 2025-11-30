<?php

return [
    'up' => "
        CREATE TABLE failed_jobs (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            connection TEXT NOT NULL,
            queue TEXT NOT NULL,
            payload LONGTEXT NOT NULL,
            exception LONGTEXT NOT NULL,
            failed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_failed_at (failed_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ",
    
    'down' => "DROP TABLE IF EXISTS failed_jobs;"
];
