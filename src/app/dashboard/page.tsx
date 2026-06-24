"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PRAYER_TIMES } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import type { Student } from "@/lib/types";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Settings, LogOut, Users, BarChart3, ShieldCheck } from "lucide-react";
import { useAppStore } from "@/lib/store";

export default function DashboardPage() {
  const router = useRouter();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const logout = useAppStore((s) => s.logout);
  const [todayAttendance, setTodayAttendance] = useState<Record<string, number>>({});
  const [totalStudents, setTotalStudents] = useState(0);
  const [today] = useState(() => format(new Date(), "yyyy-MM-dd"));

  useEffect(() => {
    fetchTodayStats();
  }, [today]);

  const fetchTodayStats = async () => {
    // Get total active students
    const { count } = await supabase
      .from("students")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);
    setTotalStudents(count || 0);

    // Get today's attendance counts per prayer
    const { data } = await supabase
      .from("attendance")
      .select("prayer_time_id, status")
      .eq("date", today)
      .eq("status", "hadir");

    if (data) {
      const counts: Record<string, number> = {};
      data.forEach((a: { prayer_time_id: string; status: string }) => {
        counts[a.prayer_time_id] = (counts[a.prayer_time_id] || 0) + 1;
      });
      setTodayAttendance(counts);
    }
  };

  const handlePrayerClick = (prayerId: string) => {
    router.push(`/absensi?prayer=${prayerId}`);
  };

  const currentDate = format(new Date(), "EEEE, dd MMMM yyyy", { locale: idLocale });

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Header */}
      <header className="bg-emerald-700 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold">Absensi Sholat</h1>
              <p className="text-emerald-200 text-xs">{process.env.NEXT_PUBLIC_SCHOOL_NAME || "Pesantren Al-Hikmah"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
                onClick={() => router.push("/admin")}
              >
                <ShieldCheck className="w-4 h-4 mr-1" />
                Admin
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
              onClick={() => router.push("/admin/laporan")}
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              Laporan
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
              onClick={() => router.push("/admin/santri")}
            >
              <Users className="w-4 h-4 mr-1" />
              Santri
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Date Banner */}
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">Tanggal Hari Ini</p>
          <p className="text-xl font-semibold text-emerald-800 mt-1 capitalize">{currentDate}</p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <Badge variant="outline" className="text-emerald-700 border-emerald-200">
              {totalStudents} Santri Aktif
            </Badge>
            <Badge variant="outline" className="text-emerald-700 border-emerald-200">
              {Object.values(todayAttendance).reduce((a, b) => a + b, 0)} Total Absensi Hari Ini
            </Badge>
          </div>
        </div>

        {/* Prayer Time Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {PRAYER_TIMES.map((prayer) => {
            const count = todayAttendance[prayer.id] || 0;
            return (
              <Card
                key={prayer.id}
                className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md overflow-hidden group"
                onClick={() => handlePrayerClick(prayer.id)}
              >
                <div className={`h-2 bg-gradient-to-r ${prayer.color}`} />
                <CardContent className="pt-5 pb-5 text-center">
                  <span className="text-4xl block mb-2 group-hover:scale-110 transition-transform">{prayer.icon}</span>
                  <h3 className="text-lg font-bold text-gray-800">{prayer.name}</h3>
                  <p className="text-sm text-gray-500 font-arabic">{prayer.nameAr}</p>
                  <div className="mt-3">
                    <span className="text-3xl font-bold text-emerald-700">{count}</span>
                    <p className="text-xs text-muted-foreground">dari {totalStudents} santri</p>
                  </div>
                  <Button
                    className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm h-9"
                  >
                    Mulai Absensi
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
