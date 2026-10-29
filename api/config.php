<?php
// Shared setup for every API endpoint: database connection, sessions and helper functions.
declare(strict_types=1);

const TRADES = ['Mason','Electrician','Plumber','Carpenter','Painter','Welder','Roofer','Landscaper'];
const LANGS  = ['en','si','ta'];

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function out($data, int $code = 200) { http_response_code($code); echo json_encode($data, JSON_UNESCAPED_UNICODE); exit; }
function fail(string $msg, int $code = 400) { out(['error' => $msg], $code); }

set_exception_handler(function (Throwable $e) {
    error_log((string)$e);
    out(['error' => 'Server error. Check the PHP error log for details.'], 500);
});

// Database settings: copy config.local.example.php to config.local.php to change them.
$cfg = ['host' => '127.0.0.1', 'port' => 3306, 'name' => 'jobmate', 'user' => 'root', 'pass' => ''];
if (is_file(__DIR__ . '/config.local.php')) $cfg = array_merge($cfg, require __DIR__ . '/config.local.php');

session_name('jobmate_session');
session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax', 'path' => '/']);
session_start();

try {
    $pdo = new PDO("mysql:host={$cfg['host']};port={$cfg['port']};dbname={$cfg['name']};charset=utf8mb4", $cfg['user'], $cfg['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    error_log($e->getMessage());
    fail('Cannot connect to the database. Check that MySQL is running and the settings in api/config.php or api/config.local.php.', 500);
}

/** Read the JSON body. Only POST + JSON is accepted (this also blocks cross-site form posts). */
function body(): array {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('POST required.', 405);
    if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0) fail('JSON required.', 415);
    $d = json_decode(file_get_contents('php://input'), true);
    return is_array($d) ? $d : [];
}
function str(array $d, string $k, int $max = 255): string {
    $v = $d[$k] ?? '';
    return is_string($v) || is_numeric($v) ? mb_substr(trim((string)$v), 0, $max) : '';
}
function valid_email(string $e): bool { return strlen($e) <= 120 && filter_var($e, FILTER_VALIDATE_EMAIL) !== false; }
function skills_from($v): array {
    if (!is_array($v)) return [];
    $o = [];
    foreach ($v as $s) { $s = mb_substr(trim((string)$s), 0, 40); if ($s !== '') $o[] = $s; }
    return array_slice(array_values(array_unique($o)), 0, 15);
}
function check_worker_fields(array $d): array {
    $trade = str($d, 'trade', 40); $exp = $d['exp'] ?? null; $skills = skills_from($d['skills'] ?? []);
    if (!in_array($trade, TRADES, true)) fail('Select your trade.');
    if (!is_numeric($exp) || (int)$exp < 0 || (int)$exp > 60) fail('Enter your years of experience (0 to 60).');
    if (!$skills) fail('Add at least one skill.');
    return [$trade, (int)$exp, $skills, str($d, 'bio', 1000)];
}

function load_user(int $id): ?array {
    global $pdo;
    $s = $pdo->prepare('SELECT u.*, w.id AS worker_id FROM users u LEFT JOIN worker_profiles w ON w.user_id = u.id WHERE u.id = ?');
    $s->execute([$id]);
    return $s->fetch() ?: null;
}
function current_user(): ?array { return empty($_SESSION['uid']) ? null : load_user((int)$_SESSION['uid']); }
function require_login(): array { $u = current_user(); if (!$u) fail('Please log in.', 401); return $u; }
function full_name(array $u): string { return trim($u['first_name'] . ' ' . $u['last_name']); }
function public_user(array $u): array {
    $roles = [];
    if ($u['worker_id']) $roles[] = 'worker';
    if ($u['is_client']) $roles[] = 'client';
    return [
        'id' => (string)$u['id'], 'first' => $u['first_name'], 'last' => $u['last_name'], 'email' => $u['email'],
        'phone' => $u['phone'], 'location' => $u['location'], 'photo' => $u['photo'], 'roles' => $roles,
        'proId' => $u['worker_id'] ? (string)$u['worker_id'] : null, 'lang' => $u['language'],
        'created' => date('c', strtotime($u['created_at'])),
    ];
}
function start_session(int $uid): void { session_regenerate_id(true); $_SESSION['uid'] = $uid; }
