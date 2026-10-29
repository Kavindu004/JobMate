<?php require __DIR__ . '/config.php';
$logged = !empty($_SESSION['uid']);   // contact details are only shown to logged-in visitors
$rows = $pdo->query('SELECT w.id, w.user_id, w.trade, w.exp_years, w.skills, w.bio, w.rating, w.review_count,
                            u.first_name, u.last_name, u.phone, u.email, u.location, u.photo
                     FROM worker_profiles w JOIN users u ON u.id = w.user_id
                     ORDER BY w.rating DESC, w.review_count DESC, w.id DESC')->fetchAll();
out(array_map(fn($r) => [
    'id' => (string)$r['id'], 'userId' => (string)$r['user_id'], 'registered' => true,
    'name' => full_name(['first_name' => $r['first_name'], 'last_name' => $r['last_name']]),
    'trade' => $r['trade'], 'location' => $r['location'], 'exp' => (int)$r['exp_years'],
    'rating' => (float)$r['rating'], 'count' => (int)$r['review_count'],
    'phone' => $logged ? $r['phone'] : null, 'email' => $logged ? $r['email'] : null,
    'skills' => json_decode($r['skills'] ?: '[]', true) ?: [], 'bio' => (string)$r['bio'], 'photo' => $r['photo'],
], $rows));
