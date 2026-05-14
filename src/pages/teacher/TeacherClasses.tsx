import TeacherPageShell from "./TeacherPageShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ChevronRight } from "lucide-react";

const classes = [
  { name: "3ème A", subject: "Mathématiques", students: 28, average: 13.4 },
  { name: "3ème B", subject: "Mathématiques", students: 30, average: 12.1 },
  { name: "4ème A", subject: "Mathématiques", students: 27, average: 14.2 },
  { name: "4ème B", subject: "Mathématiques", students: 29, average: 11.8 },
];

const TeacherClasses = () => (
  <TeacherPageShell title="Mes classes" subtitle="Aperçu de toutes les classes que vous enseignez">
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {classes.map((c) => (
        <Card key={c.name} className="glass-card transition-all hover:shadow-lg">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{c.name}</CardTitle>
                <CardDescription>{c.subject}</CardDescription>
              </div>
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                {c.average}/20
              </span>
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              {c.students} élèves
            </div>
            <Button variant="ghost" size="sm">
              Détails <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  </TeacherPageShell>
);

export default TeacherClasses;
