CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  registration TEXT NOT NULL,
  branch TEXT,
  phone TEXT,
  email TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('Dance','Drama / Acting','Singing')),
  performance TEXT,
  participants INTEGER DEFAULT 1,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  coordinator TEXT,
  coordinator_phone TEXT,
  performance_time TEXT,
  performance_order INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS passes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  registration TEXT NOT NULL,
  branch TEXT,
  pass_type TEXT NOT NULL CHECK (pass_type IN ('FRESHER','SENIOR')),
  year_semester TEXT,
  phone TEXT,
  email TEXT,
  price INTEGER NOT NULL,
  discount INTEGER NOT NULL DEFAULT 0,
  pass_code TEXT NOT NULL UNIQUE,
  qr_token TEXT NOT NULL UNIQUE,
  payment_status TEXT NOT NULL DEFAULT 'PENDING',
  used_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS coupons (
  code TEXT PRIMARY KEY,
  discount_type TEXT NOT NULL,
  discount_value INTEGER NOT NULL,
  expiry TEXT,
  usage_limit INTEGER,
  per_user_limit INTEGER,
  min_purchase INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  expires_at INTEGER NOT NULL
);
INSERT OR IGNORE INTO settings(key,value) VALUES
 ('eventName','Diploma Engineering Freshers'),('eventYear','2026'),('university','Usha Martin University'),
 ('heroHeading','Diploma Engineering Freshers'),('heroAccent','Passes & Cultural Events'),
 ('eventDate','TO BE ANNOUNCED SOON'),('eventTime',''),('venue','Usha Martin University Campus'),('passPrice','499'),
 ('heroImage','https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1800&q=85'),
 ('danceImage','https://images.unsplash.com/photo-1504609813442-a8924e83f7c9?auto=format&fit=crop&w=900&q=85'),
 ('dramaImage','https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=900&q=85'),
 ('singingImage','https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=85');
INSERT INTO announcements(title,body,published)
SELECT 'Freshers event update','Freshers event date will be announced soon.',1
WHERE NOT EXISTS (SELECT 1 FROM announcements);
