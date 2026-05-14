import AdminPageShell from "./AdminPageShell";

const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
const slots = ["08h-09h", "09h-10h", "10h-11h", "11h-12h", "14h-15h", "15h-16h"];

const AdminTimetable = () => (
  <AdminPageShell title="Emplois du temps" subtitle="Vue globale par classe">
    <div className="glass-card p-4 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="p-2 text-left text-muted-foreground">Horaire</th>
            {days.map((d) => <th key={d} className="p-2 text-left text-muted-foreground">{d}</th>)}
          </tr>
        </thead>
        <tbody>
          {slots.map((s) => (
            <tr key={s} className="border-t border-border">
              <td className="p-2 font-medium text-muted-foreground">{s}</td>
              {days.map((d) => (
                <td key={d} className="p-2">
                  <div className="rounded-lg bg-primary/10 p-2 text-xs">
                    <div className="font-semibold text-foreground">Math</div>
                    <div className="text-muted-foreground">6ème A · S.12</div>
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </AdminPageShell>
);

export default AdminTimetable;
