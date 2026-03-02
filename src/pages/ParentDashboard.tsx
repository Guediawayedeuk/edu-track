import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import GradeChart from "@/components/GradeChart";
import TimetablePreview from "@/components/TimetablePreview";
import { ClipboardList, Award, Calendar, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";

const subjectGrades = [
  { matiere: "Mathématiques", note: 15.5, coef: 4 },
  { matiere: "Français", note: 13.0, coef: 3 },
  { matiere: "Sciences", note: 16.2, coef: 3 },
  { matiere: "Histoire-Géo", note: 12.5, coef: 2 },
  { matiere: "Anglais", note: 14.0, coef: 2 },
  { matiere: "EPS", note: 17.0, coef: 1 },
];

const radialData = [{ name: "Moyenne", value: 14.5, fill: "hsl(199, 89%, 48%)" }];

const ParentDashboard = () => {
  return (
    <DashboardLayout role="parent" userName="M. Martin">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Suivi de Lucas Martin</h2>
        <p className="text-muted-foreground">Classe de 3ème A — Année 2025-2026</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard title="Moyenne générale" value="14.5/20" subtitle="+0.8 ce trimestre" icon={Award} variant="blue" delay={0} />
        <StatCard title="Dernière note" value="16/20" subtitle="Maths - Contrôle" icon={ClipboardList} variant="teal" delay={0.1} />
        <StatCard title="Absences" value={2} subtitle="Ce trimestre" icon={Calendar} variant="warm" delay={0.2} />
        <StatCard title="Messages" value={3} subtitle="Non lus" icon={MessageSquare} variant="success" delay={0.3} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <div className="lg:col-span-2">
          <GradeChart title="Évolution de la moyenne" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="glass-card p-6 flex flex-col items-center justify-center"
        >
          <h3 className="mb-2 text-lg font-semibold text-foreground">Moyenne générale</h3>
          <ResponsiveContainer width="100%" height={180}>
            <RadialBarChart
              cx="50%" cy="50%"
              innerRadius="60%" outerRadius="90%"
              startAngle={180} endAngle={0}
              barSize={12}
              data={radialData}
            >
              <RadialBar dataKey="value" cornerRadius={10} background={{ fill: "hsl(210, 20%, 93%)" }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <p className="text-4xl font-extrabold text-foreground -mt-8">14.5</p>
          <p className="text-sm text-muted-foreground">/20</p>
        </motion.div>
      </div>

      {/* Subject grades */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="glass-card p-6"
        >
          <h3 className="mb-4 text-lg font-semibold text-foreground">Notes par matière</h3>
          <div className="space-y-3">
            {subjectGrades.map((s, i) => (
              <motion.div
                key={s.matiere}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
                className="flex items-center gap-3"
              >
                <span className="w-32 text-sm font-medium text-foreground truncate">{s.matiere}</span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(s.note / 20) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.6 + i * 0.08 }}
                    className="h-full rounded-full gradient-accent"
                  />
                </div>
                <span className="w-14 text-right text-sm font-bold text-foreground">{s.note}/20</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
        <TimetablePreview />
      </div>
    </DashboardLayout>
  );
};

export default ParentDashboard;
