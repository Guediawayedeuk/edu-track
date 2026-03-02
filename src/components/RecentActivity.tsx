import { motion } from "framer-motion";
import { BookOpen, ClipboardList, UserCheck, AlertTriangle } from "lucide-react";

const activities = [
  { icon: ClipboardList, label: "Notes de Mathématiques ajoutées", detail: "Classe 3ème A", time: "Il y a 2h", color: "gradient-primary" },
  { icon: UserCheck, label: "Nouvel élève inscrit", detail: "Marie Dupont - 4ème B", time: "Il y a 3h", color: "gradient-success" },
  { icon: AlertTriangle, label: "Alerte moyenne basse", detail: "Lucas Martin - Moyenne 8.5/20", time: "Il y a 5h", color: "gradient-warm" },
  { icon: BookOpen, label: "Devoir uploadé", detail: "Français - Dissertation", time: "Hier", color: "gradient-accent" },
];

const RecentActivity = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card p-6"
    >
      <h3 className="mb-4 text-lg font-semibold text-foreground">Activité récente</h3>
      <div className="space-y-4">
        {activities.map((activity, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="flex items-start gap-3"
          >
            <div className={`rounded-lg p-2 ${activity.color} shrink-0`}>
              <activity.icon className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{activity.label}</p>
              <p className="text-xs text-muted-foreground">{activity.detail}</p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default RecentActivity;
