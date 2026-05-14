import AdminPageShell from "./AdminPageShell";
import StatCard from "@/components/StatCard";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

const records = [
  { classe: "6ème A", presents: 26, absents: 2, retards: 1 },
  { classe: "5ème B", presents: 28, absents: 1, retards: 0 },
  { classe: "4ème A", presents: 25, absents: 2, retards: 2 },
  { classe: "3ème C", presents: 24, absents: 1, retards: 0 },
];

const AdminAttendance = () => (
  <AdminPageShell title="Gestion des présences" subtitle="Vue d'ensemble du jour">
    <div className="grid gap-4 sm:grid-cols-3 mb-6">
      <StatCard title="Présents" value={103} icon={CheckCircle2} variant="success" delay={0} />
      <StatCard title="Absents" value={6} icon={XCircle} variant="warm" delay={0.1} />
      <StatCard title="Retards" value={3} icon={Clock} variant="blue" delay={0.2} />
    </div>
    <div className="glass-card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left text-muted-foreground">
          <tr><th className="px-4 py-3">Classe</th><th className="px-4 py-3">Présents</th><th className="px-4 py-3">Absents</th><th className="px-4 py-3">Retards</th></tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.classe} className="border-t border-border">
              <td className="px-4 py-3 font-medium text-foreground">{r.classe}</td>
              <td className="px-4 py-3 text-emerald-600">{r.presents}</td>
              <td className="px-4 py-3 text-rose-600">{r.absents}</td>
              <td className="px-4 py-3 text-amber-600">{r.retards}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </AdminPageShell>
);

export default AdminAttendance;
