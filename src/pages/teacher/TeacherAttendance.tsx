import { useState } from "react";
import TeacherPageShell from "./TeacherPageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Clock } from "lucide-react";
import { toast } from "sonner";

const initial = [
  { id: 1, name: "Lucas Martin", status: "present" as const },
  { id: 2, name: "Emma Petit", status: "present" as const },
  { id: 3, name: "Hugo Bernard", status: "absent" as const },
  { id: 4, name: "Léa Dubois", status: "present" as const },
  { id: 5, name: "Noah Robert", status: "late" as const },
  { id: 6, name: "Chloé Moreau", status: "present" as const },
];

type Status = "present" | "absent" | "late";

const TeacherAttendance = () => {
  const [students, setStudents] = useState(initial);

  const setStatus = (id: number, status: Status) =>
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));

  const save = () => toast.success("Présences enregistrées");

  return (
    <TeacherPageShell
      title="Gestion des présences"
      subtitle="3ème A — Mathématiques • Aujourd'hui"
      actions={<Button onClick={save}>Enregistrer</Button>}
    >
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Liste d'appel ({students.length})</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {students.map((s) => (
            <div key={s.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                  {s.name.charAt(0)}
                </div>
                <p className="font-medium">{s.name}</p>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant={s.status === "present" ? "default" : "ghost"}
                  onClick={() => setStatus(s.id, "present")}
                >
                  <Check className="h-4 w-4" /> Présent
                </Button>
                <Button
                  size="sm"
                  variant={s.status === "late" ? "default" : "ghost"}
                  onClick={() => setStatus(s.id, "late")}
                >
                  <Clock className="h-4 w-4" /> Retard
                </Button>
                <Button
                  size="sm"
                  variant={s.status === "absent" ? "destructive" : "ghost"}
                  onClick={() => setStatus(s.id, "absent")}
                >
                  <X className="h-4 w-4" /> Absent
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </TeacherPageShell>
  );
};

export default TeacherAttendance;
