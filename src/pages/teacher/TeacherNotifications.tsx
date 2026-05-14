import TeacherPageShell from "./TeacherPageShell";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, AlertTriangle, Calendar, MessageSquare } from "lucide-react";

const items = [
  { icon: AlertTriangle, color: "text-destructive", title: "Note manquante", desc: "Saisir la note d'Hugo Bernard pour le contrôle du 12 mai", time: "Il y a 2h" },
  { icon: Calendar, color: "text-primary", title: "Réunion pédagogique", desc: "Salle 204 — vendredi 17 mai à 17h00", time: "Il y a 5h" },
  { icon: MessageSquare, color: "text-accent-foreground", title: "Nouveau message", desc: "M. Petit souhaite échanger au sujet d'Emma", time: "Hier" },
  { icon: Bell, color: "text-muted-foreground", title: "Bulletins disponibles", desc: "Les bulletins du 2ème trimestre sont prêts à être validés", time: "2 jours" },
];

const TeacherNotifications = () => (
  <TeacherPageShell title="Notifications" subtitle="Toutes vos alertes et mises à jour">
    <div className="space-y-3">
      {items.map((n, i) => (
        <Card key={i} className="glass-card transition-all hover:shadow-md">
          <CardContent className="flex items-start gap-4 p-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted ${n.color}`}>
              <n.icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <p className="font-semibold">{n.title}</p>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{n.time}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{n.desc}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </TeacherPageShell>
);

export default TeacherNotifications;
