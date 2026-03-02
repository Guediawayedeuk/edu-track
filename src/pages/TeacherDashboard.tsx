import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import GradeChart from "@/components/GradeChart";
import TimetablePreview from "@/components/TimetablePreview";
import { Users, ClipboardList, BookOpen, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

const alertStudents = [
  { name: "Lucas Martin", classe: "3ème A", moyenne: 8.5, trend: "↓" },
  { name: "Emma Petit", classe: "4ème B", moyenne: 9.2, trend: "↓" },
  { name: "Hugo Bernard", classe: "3ème A", moyenne: 7.8, trend: "↓" },
];

const TeacherDashboard = () => {
  return (
    <DashboardLayout role="teacher" userName="Mme. Dupont">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Bonjour, Mme. Dupont 👋</h2>
        <p className="text-muted-foreground">Vous avez 4 cours aujourd'hui</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard title="Mes classes" value={4} subtitle="120 élèves" icon={BookOpen} variant="blue" delay={0} />
        <StatCard title="Notes à saisir" value={12} subtitle="Cette semaine" icon={ClipboardList} variant="teal" delay={0.1} />
        <StatCard title="Absences" value={3} subtitle="Aujourd'hui" icon={Users} variant="warm" delay={0.2} />
        <StatCard title="Alertes" value={3} subtitle="Moyennes basses" icon={AlertTriangle} variant="warm" delay={0.3} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <TimetablePreview />
        <GradeChart title="Moyennes de mes classes" />
      </div>

      {/* Alert students */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="glass-card p-6"
      >
        <h3 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Élèves en difficulté
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 text-left font-semibold text-muted-foreground">Élève</th>
                <th className="pb-3 text-left font-semibold text-muted-foreground">Classe</th>
                <th className="pb-3 text-left font-semibold text-muted-foreground">Moyenne</th>
                <th className="pb-3 text-left font-semibold text-muted-foreground">Tendance</th>
              </tr>
            </thead>
            <tbody>
              {alertStudents.map((s, i) => (
                <motion.tr
                  key={s.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="border-b border-border/50"
                >
                  <td className="py-3 font-medium text-foreground">{s.name}</td>
                  <td className="py-3 text-muted-foreground">{s.classe}</td>
                  <td className="py-3">
                    <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
                      {s.moyenne}/20
                    </span>
                  </td>
                  <td className="py-3 text-destructive font-bold">{s.trend}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
