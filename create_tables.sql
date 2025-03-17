CREATE TABLE active_users (
    session_id VARCHAR(255) PRIMARY KEY,
    last_activity DATETIME NOT NULL
);

CREATE TABLE total_visits (
    visit_date DATE PRIMARY KEY,
    count INT NOT NULL DEFAULT 0
); 