<?php require __DIR__ . '/config.php';
$u = require_login();
$d = body();
$role = $d['role'] ?? '';
$phone = str($d, 'phone', 30) ?: $u['phone']; $loc = str($d, 'location', 100) ?: $u['location'];

if ($role === 'client') {
    if ($u['is_client']) fail('You are already registered as a client.');
    $pdo->prepare('UPDATE users SET is_client = 1, phone = ?, location = ? WHERE id = ?')->execute([$phone, $loc, $u['id']]);
} elseif ($role === 'worker') {
    if ($u['worker_id']) fail('You are already registered as a worker.');
    if ($loc === '' || $phone === '') fail('Workers need a location and a phone number.');
    $w = check_worker_fields($d);
    $pdo->beginTransaction();
    $pdo->prepare('UPDATE users SET phone = ?, location = ? WHERE id = ?')->execute([$phone, $loc, $u['id']]);
    $pdo->prepare('INSERT INTO worker_profiles (user_id,trade,exp_years,skills,bio) VALUES (?,?,?,?,?)')
        ->execute([$u['id'], $w[0], $w[1], json_encode($w[2], JSON_UNESCAPED_UNICODE), $w[3]]);
    $pdo->commit();
} else fail('Unknown role.');
out(['ok' => true]);
