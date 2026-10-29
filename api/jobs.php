<?php require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {            // post a job (clients only)
    $u = require_login();
    if (!$u['is_client']) fail('Register as a Client first.', 403);
    $d = body();
    $title = str($d, 'title', 150); $trade = str($d, 'trade', 40); $loc = str($d, 'location', 100); $desc = str($d, 'description', 2000);
    $budget = $d['budget'] ?? 0;
    if ($title === '' || $loc === '' || $desc === '') fail('Fill in the title, location and job details.');
    if (!in_array($trade, TRADES, true)) fail('Choose the trade you need.');
    if (!is_numeric($budget) || (int)$budget < 0 || (int)$budget > 100000000) fail('Enter a valid budget.');
    $pdo->prepare('INSERT INTO jobs (owner_id,title,trade,location,budget,description) VALUES (?,?,?,?,?,?)')
        ->execute([$u['id'], $title, $trade, $loc, (int)$budget, $desc]);
    out(['id' => (string)$pdo->lastInsertId()], 201);
}

// list jobs. Applicant details are only included for the person who posted the job.
$uid = (int)($_SESSION['uid'] ?? 0);
$jobs = $pdo->query('SELECT j.id, j.owner_id, j.title, j.trade, j.location, j.budget, j.description, j.hired_worker_id,
                            o.first_name, o.last_name, hu.first_name AS hf, hu.last_name AS hl
                     FROM jobs j JOIN users o ON o.id = j.owner_id
                     LEFT JOIN worker_profiles hw ON hw.id = j.hired_worker_id
                     LEFT JOIN users hu ON hu.id = hw.user_id
                     ORDER BY j.id DESC')->fetchAll();
$apps = $pdo->query('SELECT a.job_id, a.message, w.id AS worker_id, w.exp_years, w.skills, u.first_name, u.last_name, u.phone, u.email, u.photo
                     FROM applications a JOIN worker_profiles w ON w.id = a.worker_id JOIN users u ON u.id = w.user_id
                     ORDER BY a.id')->fetchAll();
$by = [];
foreach ($apps as $a) $by[$a['job_id']][] = $a;

$result = [];
foreach ($jobs as $j) {
    $mine = (int)$j['owner_id'] === $uid;
    $list = [];
    foreach ($by[$j['id']] ?? [] as $a) {
        $list[] = $mine ? [
            'proId' => (string)$a['worker_id'], 'name' => full_name(['first_name' => $a['first_name'], 'last_name' => $a['last_name']]),
            'exp' => (int)$a['exp_years'], 'skills' => json_decode($a['skills'] ?: '[]', true) ?: [], 'msg' => (string)$a['message'],
            'phone' => $a['phone'], 'email' => $a['email'], 'photo' => $a['photo'],
        ] : ['proId' => (string)$a['worker_id']];
    }
    $result[] = [
        'id' => (string)$j['id'], 'ownerId' => (string)$j['owner_id'], 'title' => $j['title'], 'trade' => $j['trade'],
        'location' => $j['location'], 'budget' => (int)$j['budget'], 'desc' => $j['description'],
        'name' => full_name(['first_name' => $j['first_name'], 'last_name' => $j['last_name']]),
        'apps' => $list,
        'hired' => $j['hired_worker_id'] ? ['proId' => (string)$j['hired_worker_id'], 'name' => full_name(['first_name' => $j['hf'], 'last_name' => $j['hl']])] : null,
    ];
}
out($result);
