<?php require __DIR__ . '/config.php';
$u = require_login();
if (!$u['worker_id']) fail('Register as a Worker first.', 403);
$d = body();
$s = $pdo->prepare('SELECT * FROM jobs WHERE id = ?'); $s->execute([(int)($d['jobId'] ?? 0)]);
$job = $s->fetch();
if (!$job) fail('Job not found.', 404);
$s = $pdo->prepare('SELECT trade FROM worker_profiles WHERE id = ?'); $s->execute([$u['worker_id']]);
if ($s->fetchColumn() !== $job['trade']) fail('This job needs a ' . $job['trade'] . '. You can only apply to jobs that match your trade.');
if ((int)$job['owner_id'] === (int)$u['id']) fail('You cannot apply to your own job.');
if ($job['hired_worker_id']) fail('This job has already been filled.');
try {
    $pdo->prepare('INSERT INTO applications (job_id,worker_id,message) VALUES (?,?,?)')->execute([$job['id'], $u['worker_id'], str($d, 'message', 1000)]);
} catch (PDOException $e) {
    if ($e->getCode() === '23000') fail('You have already applied to this job.');
    throw $e;
}
out(['ok' => true], 201);
