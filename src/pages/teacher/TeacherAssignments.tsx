import TeacherPageShell from "./TeacherPageShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar } from "lucide-react";

const items = [
  { title: "Exercices chapitre 7", classe: "3ème A", due: "20 mai", submitted: 18, total: 28 },
  { title: "DM sur les équations", classe: "4ème B", due: "22 mai", submitted: 5, total: 29 },
  { title: "Fiche de révision", classe: "3ème B", due: "25 mai", submitted: 0, total: 30 },
];

const TeacherAssignments = () => (
  <TeacherPageShell
    title="Devoirs et exercices"
    subtitle="Suivez les devoirs distribués à vos classes"
    actions={<Button><Plus className="h-4 w-4" /> Nouveau devoir</Button>}
  >
    <div className="grid gap-4">
      {items.map((it) => (
        <Card key={it.title} className="glass-card">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{it.title}</CardTitle>
                <CardDescription>{it.classe}</CardDescription>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent-foreground">
                <Calendar className="h-3 w-3" /> {it.due}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-muted-foreground">Rendus</span>
              <span className="font-semibold">{it.submitted}/{it.total}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full gradient-primary"
                style={{ width: `${(it.submitted / it.total) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </TeacherPageShell>
);

export default TeacherAssignments;
