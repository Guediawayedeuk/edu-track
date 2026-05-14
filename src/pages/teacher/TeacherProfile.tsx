import TeacherPageShell from "./TeacherPageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const TeacherProfile = () => (
  <TeacherPageShell title="Profil enseignant" subtitle="Gérez vos informations personnelles">
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <Card className="glass-card">
        <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full gradient-primary text-3xl font-bold text-primary-foreground">
            D
          </div>
          <div>
            <p className="text-lg font-semibold">Mme. Dupont</p>
            <p className="text-sm text-muted-foreground">Professeure de Mathématiques</p>
          </div>
          <Button variant="outline" className="w-full">Changer la photo</Button>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Informations personnelles</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Prénom</Label>
            <Input defaultValue="Sophie" />
          </div>
          <div className="space-y-2">
            <Label>Nom</Label>
            <Input defaultValue="Dupont" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" defaultValue="s.dupont@edutrack.com" />
          </div>
          <div className="space-y-2">
            <Label>Téléphone</Label>
            <Input defaultValue="06 12 34 56 78" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Matière principale</Label>
            <Input defaultValue="Mathématiques" />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <Button onClick={() => toast.success("Profil mis à jour")}>Enregistrer</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </TeacherPageShell>
);

export default TeacherProfile;
