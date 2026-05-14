import AdminPageShell from "./AdminPageShell";
import { Bell, AlertTriangle, Info, CheckCircle2 } from "lucide-react";

const items = [
  { icon: AlertTriangle, color: "text-amber-600 bg-amber-500/15", titre: "5 élèves en difficulté", desc: "Moyenne < 8/20 ce trimestre", time: "Il y a 2h" },
  { icon: Info, color: "text-blue-600 bg-blue-500/15", titre: "Nouvelle inscription", desc: "Théo Lambert - 6ème A", time: "Il y a 5h" },
  { icon: CheckCircle2, color: "text-emerald-600 bg-emerald-500/15", titre: "Sauvegarde effectuée", desc: "Toutes les données sont sécurisées", time: "Hier" },
  { icon: Bell, color: "text-violet-600 bg-violet-500/15", titre: "Réunion prévue", desc: "Conseil de classe demain à 18h", time: "Hier" },
];

const AdminNotifications = () => (
  <AdminPageShell title="Notifications" subtitle="Alertes et événements récents">
    <div className="space-y-3">
      {items.map((n, i) => (
        <div key={i} className="glass-card p-4 flex items-start gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${n.color}`}>
            <n.icon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between">
              <h4 className="font-semibold text-foreground">{n.titre}</h4>
              <span className="text-xs text-muted-foreground">{n.time}</span>
            </div>
            <p className="text-sm text-muted-foreground">{n.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </AdminPageShell>
);

export default AdminNotifications;
