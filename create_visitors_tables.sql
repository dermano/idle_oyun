-- Veritabanını oluştur (eğer yoksa)
CREATE DATABASE IF NOT EXISTS idle_game;
USE idle_game;

-- Aktif kullanıcılar tablosu
CREATE TABLE IF NOT EXISTS active_users (
    session_id VARCHAR(255) PRIMARY KEY,
    last_activity DATETIME NOT NULL,
    INDEX idx_last_activity (last_activity)
);

-- Toplam ziyaretler tablosu
CREATE TABLE IF NOT EXISTS total_visits (
    visit_date DATE PRIMARY KEY,
    count INT NOT NULL DEFAULT 0,
    INDEX idx_visit_date (visit_date)
); 