<?php require __DIR__ . '/config.php';
$u = require_login();
$d = body();
$wid = (int)($d['proId'] ?? 0); $stars = (int)($d['stars'] ?? 0); $text = str($d, 'text', 1000);
if ($stars < 1 || $stars > 5) fail('Choose a rating from 1 to 5.');
if ($text === '') fail('Add a short comment.');

$pdo->beginTransaction();
$s = $pdo->prepare('SELECT user_id, rating, review_count FROM worker_profiles WHERE id = ? FOR UPDATE');
$s->execute([$wid]);
$w = $s->fetch();
if (!$w) { $pdo->rollBack(); fail('Worker not found.', 404); }
if ((int)$w['user_id'] === (int)$u['id']) { $pdo->rollBack(); fail('You cannot review yourself.', 403); }
try {
    $pdo->prepare('INSERT INTO reviews (worker_id,reviewer_id,reviewer_name,stars,comment) VALUES (?,?,?,?,?)')
        ->execute([$wid, $u['id'], full_name($u), $stars, $text]);
} catch (PDOException $e) {
    $pdo->rollBack();
    if ($e->getCode() === '23000') fail('You have already reviewed this worker.');
    throw $e;
}
$n = (int)$w['review_count'];
$rating = round(((float)$w['rating'] * $n + $stars) / ($n + 1), 2);
$pdo->prepare('UPDATE worker_profiles SET rating = ?, review_count = ? WHERE id = ?')->execute([$rating, $n + 1, $wid]);
$pdo->commit();
out(['ok' => true], 201);
