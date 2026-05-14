import TeacherPageShell from "./TeacherPageShell";
import { Card, CardContent } from "@/components/ui/card";

const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
const slots = ["08h-09h", "09h-10h", "10h-11h", "11h-12h", "14h-15h", "15h-16h"];
const schedule: Record<string, string> = {
  "Lundi-08h-09h": "3ème A",
  "Lundi-10h-11h": "4ème B",
  "Mardi-09h-10h": "3ème B",
  "Mardi-14h-15h": "4ème A",
  "Mercredi-08h-09h": "3ème A",
  "Jeudi-11h-12h": "4ème B",
  "Vendredi-09h-10h": "3ème B",
  "Vendredi-15h-16h": "4ème A",
};

const TeacherTimetable = () => (
  <TeacherPageShell title="Emploi du temps" subtitle="Semaine du 13 au 17 mai">
    <Card className="glass-card overflow-hidden">
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="p-3 text-left font-semibold text-muted-foreground">Heure</th>
              {days.map((d) => (
                <th key={d} className="p-3 text-left font-semibold text-muted-foreground">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slots.map((s) => (
              <tr key={s} className="border-t border-border">
                <td className="p-3 font-medium text-muted-foreground">{s}</td>
                {days.map((d) => {
                  const cls = schedule[`${d}-${s}`];
                  return (
                    <td key={d} className="p-2">
                      {cls && (
                        <div className="rounded-md gradient-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-sm">
                          {cls}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  </TeacherPageShell>
);

export default TeacherTimetable;
