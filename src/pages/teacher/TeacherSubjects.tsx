import TeacherPageShell from "./TeacherPageShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

const subjects = [
  { name: "Mathématiques", level: "Collège", classes: 4, hours: 18 },
  { name: "Algèbre avancée", level: "4ème", classes: 1, hours: 4 },
];

const TeacherSubjects = () => (
  <TeacherPageShell title="Mes matières" subtitle="Les matières que vous enseignez cette année">
    <div className="grid gap-4 sm:grid-cols-2">
      {subjects.map((s) => (
        <Card key={s.name} className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary text-primary-foreground">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">{s.name}</CardTitle>
                <CardDescription>{s.level}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Classes</p>
              <p className="text-lg font-semibold">{s.classes}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Heures / semaine</p>
              <p className="text-lg font-semibold">{s.hours}h</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </TeacherPageShell>
);

export default TeacherSubjects;
