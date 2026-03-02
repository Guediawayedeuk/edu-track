import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import GradeChart from "@/components/GradeChart";
import RecentActivity from "@/components/RecentActivity";
import { Users, GraduationCap, BookOpen, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const classData = [
  { classe: "6ème", moyenne: 13.2 },
  { classe: "5ème", moyenne: 12.8 },
  { classe: "4ème", moyenne: 11.5 },
  { classe: "3ème", moyenne: 14.1 },
];

const AdminDashboard = () => {
  return (
    <DashboardLayout role="admin" userName="M. Directeur">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Tableau de bord</h2>
        <p className="text-muted-foreground">Vue d'ensemble de votre établissement</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard title="Élèves inscrits" value={487} subtitle="+12 ce mois" icon={Users} variant="blue" delay={0} />
        <StatCard title="Enseignants" value={32} subtitle="4 matières" icon={GraduationCap} variant="teal" delay={0.1} />
        <StatCard title="Classes" value={18} subtitle="6 niveaux" icon={BookOpen} variant="success" delay={0.2} />
        <StatCard title="Alertes" value={5} subtitle="Élèves en difficulté" icon={AlertTriangle} variant="warm" delay={0.3} />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <GradeChart title="Moyenne générale - Évolution" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="glass-card p-6"
        >
          <h3 className="mb-4 text-lg font-semibold text-foreground">Moyennes par classe</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={classData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
              <XAxis dataKey="classe" stroke="hsl(215, 15%, 47%)" fontSize={12} />
              <YAxis domain={[0, 20]} stroke="hsl(215, 15%, 47%)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(214, 20%, 88%)",
                  borderRadius: "12px",
                }}
              />
              <Bar dataKey="moyenne" fill="hsl(199, 89%, 48%)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <RecentActivity />
    </DashboardLayout>
  );
};

export default AdminDashboard;
