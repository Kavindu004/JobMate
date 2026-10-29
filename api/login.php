<?php require __DIR__ . '/config.php';
$d = body();
$email = strtolower(str($d, 'email', 120));
$s = $pdo->prepare('SELECT id, password_hash FROM users WHERE email = ?');
$s->execute([$email]);
$u = $s->fetch();
if (!$u || !password_verify((string)($d['password'] ?? ''), $u['password_hash'])) {
    usleep(400000);                       // slows down password guessing
    fail('Incorrect email or password.', 401);
}
start_session((int)$u['id']);
out(['ok' => true]);
