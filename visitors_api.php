<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Hata raporlamayı etkinleştir
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    // Veritabanı bağlantısı
    $db = new PDO('mysql:host=localhost;dbname=idle_game', 'root', '', [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // Eski oturumları temizle (5 dakikadan eski)
    $db->query("DELETE FROM active_users WHERE last_activity < DATE_SUB(NOW(), INTERVAL 5 MINUTE)");

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Oturum ID'sini al veya oluştur
        $sessionId = $_POST['sessionId'] ?? uniqid('session_', true);
        
        // Aktif kullanıcıyı güncelle veya ekle
        $stmt = $db->prepare("INSERT INTO active_users (session_id, last_activity) 
                             VALUES (?, NOW()) 
                             ON DUPLICATE KEY UPDATE last_activity = NOW()");
        $stmt->execute([$sessionId]);

        // Günlük ziyaret sayısını güncelle
        $stmt = $db->prepare("INSERT INTO total_visits (visit_date, count) 
                            VALUES (CURDATE(), 1) 
                            ON DUPLICATE KEY UPDATE count = count + 1");
        $stmt->execute();
    }

    // İstatistikleri al
    $activeUsers = $db->query("SELECT COUNT(*) FROM active_users")->fetchColumn();
    $totalVisits = $db->query("SELECT SUM(count) FROM total_visits")->fetchColumn();

    echo json_encode([
        'success' => true,
        'activeUsers' => (int)$activeUsers,
        'totalVisits' => (int)$totalVisits
    ]);

} catch (PDOException $e) {
    error_log('Veritabanı hatası: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => 'Veritabanı hatası'
    ]);
}
?> 