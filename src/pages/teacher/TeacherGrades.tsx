import { useState } from "react";
import TeacherPageShell from "./TeacherPageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const initial = [
  { id: 1, name: "Lucas Martin", grade: "" },
  { id: 2, name: "Emma Petit", grade: "" },
  { id: 3, name: "Hugo Bernard", grade: "" },
  { id: 4, name: "Léa Dubois", grade: "" },
  { id: 5, name: "Noah Robert", grade: "" },
  { id: 6, name: "Chloé Moreau", grade: "" },
];

const TeacherGrades = () => {
  const [rows, setRows] = useState(initial);

  return (
    <TeacherPageShell
      title="Gestion des notes"
      subtitle="3ème A — Contrôle d'algèbre du 15 mai"
      actions={<Button onClick={() => toast.success("Notes enregistrées")}>Enregistrer</Button>}
    >
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Saisie des notes (/20)</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {rows.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-4 py-3">
              <p className="font-medium">{r.name}</p>
              <Input
                type="number"
                min={0}
                max={20}
                step={0.25}
                placeholder="—"
                value={r.grade}
                onChange={(e) =>
                  setRows((p) => p.map((x) => (x.id === r.id ? { ...x, grade: e.target.value } : x)))
                }
                className="w-24 text-right"
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </TeacherPageShell>
  );
};

export default TeacherGrades;
