<?php require __DIR__ . '/config.php';
$d = body();
$first = str($d, 'first', 60); $last = str($d, 'last', 60); $email = strtolower(str($d, 'email', 120));
$pass = (string)($d['password'] ?? ''); $role = $d['role'] ?? '';
$phone = str($d, 'phone', 30); $loc = str($d, 'location', 100);

if ($first === '') fail('Enter your first name.');
if ($last === '') fail('Enter your last name.');
if (!valid_email($email)) fail('Enter a valid email address.');
if (strlen($pass) < 6) fail('Password must be at least 6 characters.');
if (!in_array($role, ['worker', 'client'], true)) fail('Choose Worker or Client.');
$w = null;
if ($role === 'worker') {
    if ($loc === '' || $phone === '') fail('Workers need a location and a phone number.');
    $w = check_worker_fields($d);
}

$pdo->beginTransaction();
try {
    $pdo->prepare('INSERT INTO users (first_name,last_name,email,password_hash,phone,location,is_client) VALUES (?,?,?,?,?,?,?)')
        ->execute([$first, $last, $email, password_hash($pass, PASSWORD_DEFAULT), $phone, $loc, $role === 'client' ? 1 : 0]);
    $uid = (int)$pdo->lastInsertId();
    if ($w) {
        $pdo->prepare('INSERT INTO worker_profiles (user_id,trade,exp_years,skills,bio) VALUES (?,?,?,?,?)')
            ->execute([$uid, $w[0], $w[1], json_encode($w[2], JSON_UNESCAPED_UNICODE), $w[3]]);
    }
    $pdo->commit();
} catch (PDOException $e) {
    $pdo->rollBack();
    if ($e->getCode() === '23000') fail('An account with this email already exists. Try logging in.');
    throw $e;
}
start_session($uid);
out(['ok' => true], 201);
