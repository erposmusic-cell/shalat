// ============ Database Types ============

export interface Student {
  id: string;
  name: string;
  nim: string;
  class: string;
  gender: 'L' | 'P';
  parent_name: string;
  parent_phone: string;
  face_descriptor: number[] | null;
  face_registered: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PrayerTime {
  id: string;
  name: string;
  name_ar: string;
  order: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export interface Attendance {
  id: string;
  student_id: string;
  student?: Student;
  prayer_time_id: string;
  prayer_time?: PrayerTime;
  date: string;
  status: 'hadir' | 'izin' | 'sakit' | 'alpha';
  verified: boolean;
  face_confidence: number | null;
  created_at: string;
}

export interface AttendanceWithStudent extends Attendance {
  student: Student;
  prayer_time: PrayerTime;
}

// ============ App Types ============

export interface AdminUser {
  username: string;
  name: string;
}

export interface FaceDetectionResult {
  detected: boolean;
  descriptor: number[] | null;
  box?: { x: number; y: number; width: number; height: number };
  error?: string;
}

export interface FaceMatchResult {
  matched: boolean;
  confidence: number;
  distance: number;
  studentId: string | null;
  studentName: string | null;
}

export interface AttendanceReport {
  student: Student;
  total: number;
  hadir: number;
  izin: number;
  sakit: number;
  alpha: number;
  percentage: number;
}

export interface DailyReport {
  date: string;
  prayerTime: PrayerTime;
  totalStudents: number;
  present: number;
  absent: number;
  permission: number;
  sick: number;
}

export interface WhatsAppMessage {
  target: string;
  message: string;
}

// ============ Prayer Time Constants ============

export const PRAYER_TIMES = [
  { id: 'subuh', name: 'Subuh', nameAr: 'فجر', order: 1, icon: '🌅', color: 'from-orange-400 to-amber-500' },
  { id: 'dzuhur', name: 'Dzuhur', nameAr: 'ظهر', order: 2, icon: '☀️', color: 'from-yellow-400 to-orange-500' },
  { id: 'ashar', name: 'Ashar', nameAr: 'عصر', order: 3, icon: '🌤️', color: 'from-amber-400 to-yellow-600' },
  { id: 'maghrib', name: 'Maghrib', nameAr: 'مغرب', order: 4, icon: '🌅', color: 'from-rose-400 to-purple-500' },
  { id: 'isya', name: 'Isya', nameAr: 'عشاء', order: 5, icon: '🌙', color: 'from-indigo-400 to-blue-600' },
] as const;

export const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  hadir: { label: 'Hadir', color: 'bg-emerald-100 text-emerald-800' },
  izin: { label: 'Izin', color: 'bg-blue-100 text-blue-800' },
  sakit: { label: 'Sakit', color: 'bg-amber-100 text-amber-800' },
  alpha: { label: 'Alpha', color: 'bg-red-100 text-red-800' },
};
