import { motion } from "framer-motion";
import { Clock } from "lucide-react";

const schedule = [
  { time: "08:00", subject: "Mathématiques", class: "3ème A", room: "Salle 12" },
  { time: "09:00", subject: "Français", class: "4ème B", room: "Salle 8" },
  { time: "10:00", subject: "Pause", class: "", room: "" },
  { time: "10:15", subject: "Sciences", class: "3ème A", room: "Labo 2" },
  { time: "11:15", subject: "Histoire", class: "5ème C", room: "Salle 15" },
];

const TimetablePreview = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="glass-card p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-secondary" />
        <h3 className="text-lg font-semibold text-foreground">Emploi du temps - Aujourd'hui</h3>
      </div>
      <div className="space-y-2">
        {schedule.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 + i * 0.08 }}
            className={`flex items-center gap-4 rounded-lg px-4 py-3 transition-colors ${
              item.class ? "hover:bg-muted/50" : "opacity-50"
            }`}
          >
            <span className="w-14 text-sm font-semibold text-secondary">{item.time}</span>
            <div className="h-8 w-0.5 rounded-full bg-border" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{item.subject}</p>
              {item.class && (
                <p className="text-xs text-muted-foreground">{item.class} • {item.room}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default TimetablePreview;
