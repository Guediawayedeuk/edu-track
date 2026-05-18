import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminPageShell from "./AdminPageShell";
import StatCard from "@/components/StatCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle, Clock, CalendarOff } from "lucide-react";
import { attendanceSummaryByClass } from "@/lib/api/attendance";
import { listClasses } from "@/lib/api/classes";

const AdminAttendance = () => {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const classesQ = useQuery({ queryKey: ["classes"], queryFn: listClasses });
  const summaryQ = useQuery({
    queryKey: ["attendance-summary", date],
    queryFn: () => attendanceSummaryByClass(date),
  });

  const totals = { present: 0, absent: 0, late: 0, excused: 0 };
  summaryQ.data?.forEach((v) => { totals.present += v.present; totals.absent += v.absent; totals.late += v.late; totals.excused += v.excused; });

  return (
    <AdminPageShell title="Gestion des présences" subtitle={`Vue d'ensemble du ${new Date(date).toLocaleDateString("fr-FR")}`}>
      <div className="glass-card p-4 mb-6 max-w-xs">
        <Label>Date</Label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <StatCard title="Présents" value={totals.present} icon={CheckCircle2} variant="success" delay={0} />
        <StatCard title="Absents" value={totals.absent} icon={XCircle} variant="warm" delay={0.1} />
        <StatCard title="Retards" value={totals.late} icon={Clock} variant="blue" delay={0.2} />
        <StatCard title="Excusés" value={totals.excused} icon={CalendarOff} variant="teal" delay={0.3} />
      </div>
      <div className="glass-card overflow-hidden">
        {summaryQ.isLoading ? <Skeleton className="h-40 m-4" /> : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-muted-foreground">
              <tr><th className="px-4 py-3">Classe</th><th className="px-4 py-3">Présents</th><th className="px-4 py-3">Absents</th><th className="px-4 py-3">Retards</th><th className="px-4 py-3">Excusés</th></tr>
            </thead>
            <tbody>
              {(classesQ.data ?? []).map((c) => {
                const v = summaryQ.data?.get(c.id) ?? { present: 0, absent: 0, late: 0, excused: 0 };
                return (
                  <tr key={c.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium text-foreground">{c.name}</td>
                    <td className="px-4 py-3 text-emerald-600">{v.present}</td>
                    <td className="px-4 py-3 text-rose-600">{v.absent}</td>
                    <td className="px-4 py-3 text-amber-600">{v.late}</td>
                    <td className="px-4 py-3 text-muted-foreground">{v.excused}</td>
                  </tr>
                );
              })}
              {!classesQ.data?.length && (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Aucune classe enregistrée</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </AdminPageShell>
  );
};

export default AdminAttendance;
