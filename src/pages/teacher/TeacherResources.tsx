import TeacherPageShell from "./TeacherPageShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Video, Image as ImageIcon, Download } from "lucide-react";

const resources = [
  { title: "Cours - Équations du 2nd degré", type: "PDF", icon: FileText, size: "1.2 Mo" },
  { title: "Vidéo - Théorème de Pythagore", type: "Vidéo", icon: Video, size: "45 Mo" },
  { title: "Schéma triangle rectangle", type: "Image", icon: ImageIcon, size: "320 Ko" },
  { title: "Exercices supplémentaires", type: "PDF", icon: FileText, size: "780 Ko" },
];

const TeacherResources = () => (
  <TeacherPageShell
    title="Ressources pédagogiques"
    subtitle="Vos cours, supports et documents partagés"
    actions={<Button><Upload className="h-4 w-4" /> Téléverser</Button>}
  >
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {resources.map((r) => (
        <Card key={r.title} className="glass-card transition-all hover:shadow-md">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <r.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base truncate">{r.title}</CardTitle>
                <CardDescription>{r.type} • {r.size}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" className="w-full">
              <Download className="h-4 w-4" /> Télécharger
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  </TeacherPageShell>
);

export default TeacherResources;
