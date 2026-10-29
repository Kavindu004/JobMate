<?php require __DIR__ . '/config.php';
$u = require_login();
$d = body();
$first = str($d, 'first', 60); $last = str($d, 'last', 60); $email = strtolower(str($d, 'email', 120));
$phone = str($d, 'phone', 30); $loc = str($d, 'location', 100);
if ($first === '' || $last === '') fail('Enter your first and last name.');
if (!valid_email($email)) fail('Enter a valid email address.');
$w = null;
if ($u['worker_id']) {
    if ($loc === '' || $phone === '') fail('Workers need a location and a phone number.');
    $w = check_worker_fields($d);
}

// profile picture: the browser sends a square JPEG as a data URL; we verify it and save it as a file
$photo = $u['photo']; $uploads = realpath(__DIR__ . '/../uploads');
$drop = function (string $p) use ($uploads) {
    if ($p !== '' && $uploads && strpos($p, 'uploads/') === 0 && is_file($uploads . '/' . basename($p))) @unlink($uploads . '/' . basename($p));
};
if (!empty($d['removePhoto'])) { $drop($photo); $photo = ''; }
if (!empty($d['photoData'])) {
    if (!is_string($d['photoData']) || !preg_match('#^data:image/jpeg;base64,([A-Za-z0-9+/=]+)$#', $d['photoData'], $m)) fail('Invalid picture. Please choose a JPG or PNG image.');
    $bin = base64_decode($m[1], true);
    if ($bin === false || strlen($bin) > 600000) fail('That picture is too large.');
    $info = @getimagesizefromstring($bin);
    if (!$info || $info[2] !== IMAGETYPE_JPEG) fail('Invalid picture. Please choose a JPG or PNG image.');
    if (!$uploads) fail('Upload folder is missing.', 500);
    $name = 'u' . $u['id'] . '_' . bin2hex(random_bytes(4)) . '.jpg';
    if (file_put_contents($uploads . '/' . $name, $bin) === false) fail('Could not save the picture. Check that the uploads folder is writable.', 500);
    $drop($photo);
    $photo = 'uploads/' . $name;
}

$pdo->beginTransaction();
try {
    $pdo->prepare('UPDATE users SET first_name=?, last_name=?, email=?, phone=?, location=?, photo=? WHERE id=?')
        ->execute([$first, $last, $email, $phone, $loc, $photo, $u['id']]);
    if ($w) {
        $pdo->prepare('UPDATE worker_profiles SET trade=?, exp_years=?, skills=?, bio=? WHERE id=?')
            ->execute([$w[0], $w[1], json_encode($w[2], JSON_UNESCAPED_UNICODE), $w[3], $u['worker_id']]);
    }
    $pdo->commit();
} catch (PDOException $e) {
    $pdo->rollBack();
    if ($e->getCode() === '23000') fail('Another account already uses this email.');
    throw $e;
}
out(['ok' => true]);
