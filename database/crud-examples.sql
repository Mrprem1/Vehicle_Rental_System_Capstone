-- Example CRUD-style queries for bike_rental

-- CREATE user (password must be hashed by app — not raw SQL in production)
-- INSERT INTO users (email, password_hash, full_name, role) VALUES ('x@y.com', '$2a$...', 'Name', 'customer');

-- READ bikes
SELECT id, brand, model, price_per_day FROM bikes WHERE is_available = 1;

-- UPDATE bike price
-- UPDATE bikes SET price_per_day = 39.99 WHERE id = 3;

-- DELETE bike (respect FKs — bookings must not block or use soft delete pattern)
-- DELETE FROM bikes WHERE id = 99;

-- CREATE booking (normally via API for overlap rules)
-- INSERT INTO bookings (user_id, bike_id, pickup_datetime, dropoff_datetime, status, total_amount)
-- VALUES (2, 3, '2026-05-01 10:00:00', '2026-05-03 10:00:00', 'pending', 120.00);

-- READ bookings for user
SELECT * FROM bookings WHERE user_id = 2 ORDER BY id DESC;

-- UPDATE booking status
-- UPDATE bookings SET status = 'cancelled' WHERE id = 10;
