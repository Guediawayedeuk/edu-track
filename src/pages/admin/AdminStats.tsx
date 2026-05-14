import AdminPageShell from "./AdminPageShell";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import StatCard from "@/components/StatCard";
import { TrendingUp, Users, GraduationCap, Award } from "lucide-react";

const evolution = [
  { mois: "Jan", moyenne: 12.4 }, { mois: "Fév", moyenne: 12.8 }, { mois: "Mar", moyenne: 13.1 },
  { mois: "Avr", moyenne: 13.5 }, { mois: "Mai", moyenne: 13.9 }, { mois: "Juin", moyenne: 14.2 },
];
const niveaux = [
  { niveau: "6ème", eleves: 120 }, { niveau: "5ème", eleves: 115 },
  { niveau: "4ème", eleves: 128 }, { niveau: "3ème", eleves: 124 },
];
const repartition = [
  { name: "Excellent", value: 35, color: "hsl(160, 84%, 50%)" },
  { name: "Bon", value: 45, color: "hsl(199, 89%, 48%)" },
  { name: "Moyen", value: 15, color: "hsl(43, 96%, 56%)" },
  { name: "Difficulté", value: 5, color: "hsl(0, 84%, 60%)" },
];

const AdminStats = () => (
  <AdminPageShell title="Rapports & statistiques" subtitle="Tableau analytique de l'établissement">
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      <StatCard title="Moyenne générale" value="14.2" subtitle="+1.8 vs N-1" icon={TrendingUp} variant="success" delay={0} />
      <StatCard title="Taux de réussite" value="92%" subtitle="Brevet 2025" icon={Award} variant="blue" delay={0.1} />
      <StatCard title="Effectif total" value={487} subtitle="4 niveaux" icon={Users} variant="teal" delay={0.2} />
      <StatCard title="Diplômés" value={124} subtitle="Promotion 2025" icon={GraduationCap} variant="warm" delay={0.3} />
    </div>

    <div className="grid gap-6 lg:grid-cols-2 mb-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">Évolution moyenne générale</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={evolution}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
            <XAxis dataKey="mois" stroke="hsl(215, 15%, 47%)" fontSize={12} />
            <YAxis domain={[10, 16]} stroke="hsl(215, 15%, 47%)" fontSize={12} />
            <Tooltip contentStyle={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(214, 20%, 88%)", borderRadius: "12px" }} />
            <Line type="monotone" dataKey="moyenne" stroke="hsl(258, 90%, 66%)" strokeWidth={3} dot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">Effectifs par niveau</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={niveaux}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
            <XAxis dataKey="niveau" stroke="hsl(215, 15%, 47%)" fontSize={12} />
            <YAxis stroke="hsl(215, 15%, 47%)" fontSize={12} />
            <Tooltip contentStyle={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(214, 20%, 88%)", borderRadius: "12px" }} />
            <Bar dataKey="eleves" fill="hsl(199, 89%, 48%)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>

    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Répartition des performances</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={repartition} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
            {repartition.map((e) => <Cell key={e.name} fill={e.color} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  </AdminPageShell>
);

export default AdminStats;
