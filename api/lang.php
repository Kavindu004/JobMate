<?php require __DIR__ . '/config.php';
$u = require_login();
$l = str(body(), 'lang', 2);
if (!in_array($l, LANGS, true)) fail('Unknown language.');
$pdo->prepare('UPDATE users SET language = ? WHERE id = ?')->execute([$l, $u['id']]);
out(['ok' => true]);
