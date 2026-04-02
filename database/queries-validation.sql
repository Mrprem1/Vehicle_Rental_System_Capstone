-- Database validation & reporting queries (run against bike_rental)

-- Users: list roles
SELECT id, email, role, created_at FROM users ORDER BY id;

-- Bikes: inventory summary
SELECT type, COUNT(*) AS cnt, SUM(stock) AS total_stock FROM bikes GROUP BY type;

-- Bookings: join user and bike
SELECT b.id, u.email, bk.brand, bk.model, b.status, b.pickup_datetime, b.total_amount
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN bikes bk ON b.bike_id = bk.id
ORDER BY b.id DESC
LIMIT 20;

-- Payments: success vs failed
SELECT status, COUNT(*) AS c, SUM(amount) AS amt FROM payments GROUP BY status;

-- Reviews: average per bike
SELECT bike_id, AVG(rating) AS avg_rating, COUNT(*) AS review_count FROM reviews GROUP BY bike_id;

-- Overlap audit (should be empty if data consistent)
SELECT b1.id AS id1, b2.id AS id2, b1.bike_id
FROM bookings b1
JOIN bookings b2 ON b1.bike_id = b2.bike_id AND b1.id < b2.id
WHERE b1.status IN ('pending','confirmed') AND b2.status IN ('pending','confirmed')
AND NOT (b1.dropoff_datetime <= b2.pickup_datetime OR b1.pickup_datetime >= b2.dropoff_datetime);

-- UI vs DB: latest booking for a user email
SELECT b.* FROM bookings b
JOIN users u ON b.user_id = u.id
WHERE u.email = 'customer@bike.local'
ORDER BY b.id DESC LIMIT 1;
