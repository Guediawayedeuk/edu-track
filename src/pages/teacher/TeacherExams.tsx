import TeacherPageShell from "./TeacherPageShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";

const exams = [
  { title: "Contrôle trimestriel", classe: "3ème A", date: "30 mai", duration: "2h", status: "À venir" },
  { title: "Évaluation chapitre 8", classe: "4ème B", date: "28 mai", duration: "1h", status: "À venir" },
  { title: "Brevet blanc", classe: "3ème A & B", date: "10 juin", duration: "3h", status: "Planifié" },
];

const TeacherExams = () => (
  <TeacherPageShell
    title="Examens"
    subtitle="Préparez et planifiez vos évaluations"
    actions={<Button><Plus className="h-4 w-4" /> Nouvel examen</Button>}
  >
    <div className="grid gap-4 md:grid-cols-2">
      {exams.map((e) => (
        <Card key={e.title} className="glass-card">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">{e.title}</CardTitle>
                <CardDescription>{e.classe}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-2 text-sm">
            <div><p className="text-muted-foreground">Date</p><p className="font-semibold">{e.date}</p></div>
            <div><p className="text-muted-foreground">Durée</p><p className="font-semibold">{e.duration}</p></div>
            <div><p className="text-muted-foreground">Statut</p><p className="font-semibold text-primary">{e.status}</p></div>
          </CardContent>
        </Card>
      ))}
    </div>
  </TeacherPageShell>
);

export default TeacherExams;
