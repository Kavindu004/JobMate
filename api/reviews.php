<?php require __DIR__ . '/config.php';
$rows = $pdo->query('SELECT r.worker_id, r.reviewer_name, r.stars, r.comment, w.trade
                     FROM reviews r JOIN worker_profiles w ON w.id = r.worker_id ORDER BY r.id DESC LIMIT 200')->fetchAll();
out(array_map(fn($r) => ['proId' => (string)$r['worker_id'], 'name' => $r['reviewer_name'], 'trade' => $r['trade'],
                         'stars' => (int)$r['stars'], 'text' => $r['comment']], $rows));
