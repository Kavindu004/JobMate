<?php require __DIR__ . '/config.php';
$u = current_user();
out($u ? public_user($u) : null);   // null when logged out
