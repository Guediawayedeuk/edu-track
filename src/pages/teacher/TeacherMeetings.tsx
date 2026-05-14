import TeacherPageShell from "./TeacherPageShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Plus, Calendar, Users } from "lucide-react";

const meetings = [
  { title: "Soutien Mathématiques", classe: "3ème A", date: "16 mai • 17h00", duration: "45 min", participants: 12 },
  { title: "Réunion parents-prof", classe: "4ème B", date: "20 mai • 18h30", duration: "1h", participants: 8 },
  { title: "Cours de révision", classe: "3ème B", date: "22 mai • 16h00", duration: "1h", participants: 25 },
];

const TeacherMeetings = () => (
  <TeacherPageShell
    title="Réunions en ligne"
    subtitle="Planifiez et lancez vos visioconférences"
    actions={<Button><Plus className="h-4 w-4" /> Planifier</Button>}
  >
    <div className="grid gap-4 md:grid-cols-2">
      {meetings.map((m) => (
        <Card key={m.title} className="glass-card">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-accent text-secondary-foreground">
                <Video className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">{m.title}</CardTitle>
                <CardDescription>{m.classe}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{m.date}</span>
              <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{m.participants}</span>
            </div>
            <Button className="w-full">
              <Video className="h-4 w-4" /> Démarrer la réunion
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  </TeacherPageShell>
);

export default TeacherMeetings;
