<?php require __DIR__ . '/config.php';
$d = body();
$name = str($d, 'name', 120); $email = strtolower(str($d, 'email', 120)); $msg = str($d, 'message', 2000);
if ($name === '' || !valid_email($email) || $msg === '') fail('Enter your name, a valid email and your message.');
$uid = !empty($_SESSION['uid']) ? (int)$_SESSION['uid'] : null;
$pdo->prepare('INSERT INTO support_messages (user_id,name,email,message) VALUES (?,?,?,?)')->execute([$uid, $name, $email, $msg]);
out(['ok' => true], 201);
