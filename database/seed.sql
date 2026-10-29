USE jobmate;

INSERT INTO users (first_name,last_name,email,password_hash,phone,location,is_client) VALUES
('Nimal','Perera','nimal@example.com','!','077 123 4567','Kandy',0),
('Sajith','Fernando','sajith@example.com','!','071 555 0192','Colombo',0),
('Ruwan','Silva','ruwan@example.com','!','076 220 3344','Galle',0),
('Kasun','Jayasuriya','kasun@example.com','!','070 889 1122','Kandy',0),
('Dilani','Wickramasinghe','dilani@example.com','!','075 410 7788','Matara',0),
('Mahesh','Kumara','mahesh@example.com','!','072 301 9900','Colombo',0),
('Chamara','Bandara','chamara@example.com','!','078 660 2211','Kurunegala',0),
('Tharindu','Senanayake','tharindu@example.com','!','074 998 1234','Kandy',0),
('A.','Rajapaksa','a.rajapaksa@example.com','!','077 000 1111','Colombo',1),
('S.','Dissanayake','s.dissanayake@example.com','!','','Kandy',1),
('M.','Ariyaratne','m.ariyaratne@example.com','!','071 222 3333','Galle',1);

INSERT INTO worker_profiles (user_id,trade,exp_years,skills,bio,rating,review_count)
SELECT id,'Mason',15,'["Brickwork","Plastering","Tiling"]','Boundary walls, house extensions and tiling.',4.9,64 FROM users WHERE email='nimal@example.com';
INSERT INTO worker_profiles (user_id,trade,exp_years,skills,bio,rating,review_count)
SELECT id,'Electrician',9,'["Wiring","Fuse boards","Solar install"]','Domestic and small commercial electrical work.',4.8,112 FROM users WHERE email='sajith@example.com';
INSERT INTO worker_profiles (user_id,trade,exp_years,skills,bio,rating,review_count)
SELECT id,'Plumber',12,'["Leak repair","Bathroom fitting","Water tanks"]','Fast call-outs and full bathroom installs.',4.7,87 FROM users WHERE email='ruwan@example.com';
INSERT INTO worker_profiles (user_id,trade,exp_years,skills,bio,rating,review_count)
SELECT id,'Carpenter',7,'["Cupboards","Doors","Roof trusses"]','Custom furniture and joinery.',4.6,41 FROM users WHERE email='kasun@example.com';
INSERT INTO worker_profiles (user_id,trade,exp_years,skills,bio,rating,review_count)
SELECT id,'Painter',6,'["Interior","Exterior","Wall textures"]','Clean, tidy finishes on time.',4.8,55 FROM users WHERE email='dilani@example.com';
INSERT INTO worker_profiles (user_id,trade,exp_years,skills,bio,rating,review_count)
SELECT id,'Welder',11,'["Gates","Steel frames","Grills"]','Fabrication for homes and workshops.',4.5,33 FROM users WHERE email='mahesh@example.com';
INSERT INTO worker_profiles (user_id,trade,exp_years,skills,bio,rating,review_count)
SELECT id,'Roofer',14,'["Tile roofing","Sheet roofing","Leak sealing"]','New roofs and repairs.',4.7,48 FROM users WHERE email='chamara@example.com';
INSERT INTO worker_profiles (user_id,trade,exp_years,skills,bio,rating,review_count)
SELECT id,'Landscaper',5,'["Lawns","Garden design","Irrigation"]','Gardens that stay green.',4.6,29 FROM users WHERE email='tharindu@example.com';

INSERT INTO jobs (owner_id,title,trade,location,budget,description)
SELECT id,'Rewire a two-bedroom house','Electrician','Colombo',60000,'Full rewiring and new fuse board. Two weeks.' FROM users WHERE email='a.rajapaksa@example.com';
INSERT INTO jobs (owner_id,title,trade,location,budget,description)
SELECT id,'Build a 20m boundary wall','Mason','Kandy',150000,'Brick wall with plaster finish. Materials on site.' FROM users WHERE email='s.dissanayake@example.com';
INSERT INTO jobs (owner_id,title,trade,location,budget,description)
SELECT id,'Fix leaking kitchen pipes','Plumber','Galle',12000,'Two leaks under the sink and one in the wall.' FROM users WHERE email='m.ariyaratne@example.com';

INSERT INTO reviews (worker_id,reviewer_name,stars,comment)
SELECT w.id,'Nadeeka P.',5,'Turned up on time, finished the wall a day early and left the site spotless.' FROM worker_profiles w JOIN users u ON u.id=w.user_id WHERE u.email='nimal@example.com';
INSERT INTO reviews (worker_id,reviewer_name,stars,comment)
SELECT w.id,'Roshan K.',5,'Explained every step of the rewiring and the price matched the quote.' FROM worker_profiles w JOIN users u ON u.id=w.user_id WHERE u.email='sajith@example.com';
INSERT INTO reviews (worker_id,reviewer_name,stars,comment)
SELECT w.id,'Hasini W.',4,'Great finish on the living room. Needed one small touch-up, fixed the next day.' FROM worker_profiles w JOIN users u ON u.id=w.user_id WHERE u.email='dilani@example.com';