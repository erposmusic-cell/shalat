-- =============================================
-- Database Schema: Absensi Sholat Pesantren
-- Run this SQL in your Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============ TABLES ============

-- Students Table
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  nim VARCHAR(50) UNIQUE NOT NULL,
  class VARCHAR(50) NOT NULL,
  gender VARCHAR(1) NOT NULL CHECK (gender IN ('L', 'P')),
  parent_name VARCHAR(200),
  parent_phone VARCHAR(20),
  face_descriptor JSONB,
  face_registered BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prayer Times Table
CREATE TABLE IF NOT EXISTS prayer_times (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  name_ar VARCHAR(50),
  "order" INTEGER NOT NULL,
  start_time TIME,
  end_time TIME,
  is_active BOOLEAN DEFAULT TRUE
);

-- Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  prayer_time_id VARCHAR(20) NOT NULL REFERENCES prayer_times(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(10) NOT NULL DEFAULT 'hadir' CHECK (status IN ('hadir', 'izin', 'sakit', 'alpha')),
  verified BOOLEAN DEFAULT FALSE,
  face_confidence DECIMAL(5, 4),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, prayer_time_id, date)
);

-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_prayer ON attendance(prayer_time_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class);
CREATE INDEX IF NOT EXISTS idx_students_active ON students(is_active);
CREATE INDEX IF NOT EXISTS idx_attendance_student_prayer_date ON attendance(student_id, prayer_time_id, date);

-- ============ SEED DATA ============

-- Insert default prayer times
INSERT INTO prayer_times (id, name, name_ar, "order", start_time, end_time) VALUES
  ('subuh', 'Subuh', 'فجر', 1, '04:30', '06:00'),
  ('dzuhur', 'Dzuhur', 'ظهر', 2, '12:00', '13:00'),
  ('ashar', 'Ashar', 'عصر', 3, '15:15', '16:00'),
  ('maghrib', 'Maghrib', 'مغرب', 4, '18:00', '18:45'),
  ('isya', 'Isya', 'عشاء', 5, '19:15', '20:00')
ON CONFLICT (id) DO NOTHING;

-- Insert default settings
INSERT INTO settings (key, value) VALUES
  ('school_name', 'Pesantren Al-Hikmah'),
  ('face_threshold', '0.6'),
  ('whatsapp_enabled', 'true'),
  ('whatsapp_api_key', ''),
  ('whatsapp_device_id', '')
ON CONFLICT (key) DO NOTHING;

-- ============ TRIGGERS ============

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============ ROW LEVEL SECURITY ============

-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for this app (simple auth)
-- In production, use Supabase Auth for proper security
CREATE POLICY "Allow all on students" ON students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on attendance" ON attendance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on prayer_times" ON prayer_times FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on settings" ON settings FOR ALL USING (true) WITH CHECK (true);

-- ============ VIEWS ============

-- Attendance summary view
CREATE OR REPLACE VIEW v_attendance_summary AS
SELECT 
  s.id AS student_id,
  s.name AS student_name,
  s.nim,
  s.class,
  pt.name AS prayer_name,
  a.date,
  a.status,
  a.verified,
  a.face_confidence,
  a.created_at AS checked_in_at
FROM students s
LEFT JOIN attendance a ON a.student_id = s.id
LEFT JOIN prayer_times pt ON a.prayer_time_id = pt.id
WHERE s.is_active = TRUE
ORDER BY s.class, s.name, pt."order", a.date DESC;

-- Daily attendance recap view
CREATE OR REPLACE VIEW v_daily_recap AS
SELECT 
  a.date,
  pt.id AS prayer_time_id,
  pt.name AS prayer_name,
  COUNT(DISTINCT s.id) AS total_active,
  COUNT(DISTINCT CASE WHEN a.status = 'hadir' THEN s.id END) AS hadir,
  COUNT(DISTINCT CASE WHEN a.status = 'izin' THEN s.id END) AS izin,
  COUNT(DISTINCT CASE WHEN a.status = 'sakit' THEN s.id END) AS sakit,
  COUNT(DISTINCT CASE WHEN a.status = 'alpha' THEN s.id END) AS alpha,
  ROUND(
    COUNT(DISTINCT CASE WHEN a.status = 'hadir' THEN s.id END)::DECIMAL /
    NULLIF(COUNT(DISTINCT s.id), 0) * 100, 1
  ) AS kehadiran_persen
FROM students s
CROSS JOIN prayer_times pt
LEFT JOIN attendance a ON a.student_id = s.id AND a.prayer_time_id = pt.id AND a.date = CURRENT_DATE
WHERE s.is_active = TRUE AND pt.is_active = TRUE
GROUP BY a.date, pt.id, pt.name
ORDER BY pt."order";
