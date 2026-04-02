USE bike_rental;

-- Password for both: Test@123 (bcrypt hash generated in seed script; placeholder replaced by init-db.js)
-- This file documents sample bikes; users inserted via scripts/init-db.js

INSERT INTO bikes (brand, model, type, price_per_day, description, image_url, stock, is_available, rating_avg, rating_count) VALUES
('Trek', 'Domane SL 5', 'road', 45.00, 'Carbon endurance road bike with disc brakes.', 'https://images.unsplash.com/photo-1485965120184-e220f7d74408?w=800', 2, 1, 4.6, 12),
('Giant', 'Trance X29', 'mountain', 55.00, 'Full suspension trail bike.', 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e12?w=800', 1, 1, 4.8, 8),
('Brompton', 'C Line Explore', 'city', 35.00, 'Foldable city commuter.', 'https://images.unsplash.com/photo-1507035895480-2b31507c44ad?w=800', 3, 1, 4.4, 20),
('Specialized', 'Turbo Vado', 'electric', 75.00, 'E-bike with integrated battery.', 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800', 2, 1, 4.7, 15),
('Cannondale', 'Quick 4', 'hybrid', 32.00, 'Light hybrid for fitness and commute.', 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800', 4, 1, 4.3, 6);

-- Maintenance slot example (bike 1 unavailable for a window)
INSERT INTO availability_slots (bike_id, start_datetime, end_datetime, reason) VALUES
(1, '2030-01-01 00:00:00', '2030-01-02 00:00:00', 'Sample maintenance window');
