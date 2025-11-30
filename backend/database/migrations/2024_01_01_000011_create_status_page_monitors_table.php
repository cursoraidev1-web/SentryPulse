<?php

return [
    'up' => "
        CREATE TABLE status_page_monitors (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            status_page_id BIGINT UNSIGNED NOT NULL,
            monitor_id BIGINT UNSIGNED NOT NULL,
            display_order INT UNSIGNED DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (status_page_id) REFERENCES status_pages(id) ON DELETE CASCADE,
            FOREIGN KEY (monitor_id) REFERENCES monitors(id) ON DELETE CASCADE,
            UNIQUE KEY unique_status_monitor (status_page_id, monitor_id),
            INDEX idx_status_page_id (status_page_id),
            INDEX idx_monitor_id (monitor_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ",
    
    'down' => "DROP TABLE IF EXISTS status_page_monitors;"
];
