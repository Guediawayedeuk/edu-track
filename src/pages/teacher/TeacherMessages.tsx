import { useState } from "react";
import TeacherPageShell from "./TeacherPageShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

const conversations = [
  { id: 1, name: "Mme Martin (Parent de Lucas)", last: "Merci pour votre retour", unread: 0, time: "10:24" },
  { id: 2, name: "M. Petit (Parent d'Emma)", last: "Pourrait-on prévoir un RDV ?", unread: 2, time: "Hier" },
  { id: 3, name: "Direction", last: "Réunion vendredi 17h", unread: 0, time: "Lundi" },
];

const TeacherMessages = () => {
  const [active, setActive] = useState(conversations[0]);
  const [text, setText] = useState("");

  return (
    <TeacherPageShell title="Messagerie" subtitle="Échangez avec les parents et la direction">
      <Card className="glass-card overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-[300px_1fr] min-h-[500px]">
          <div className="border-r border-border">
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActive(c)}
                className={`w-full border-b border-border p-4 text-left transition-colors ${
                  active.id === c.id ? "bg-muted" : "hover:bg-muted/50"
                }`}
              >
                <div className="flex justify-between">
                  <p className="font-medium truncate">{c.name}</p>
                  <span className="text-xs text-muted-foreground">{c.time}</span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground truncate">{c.last}</p>
                  {c.unread > 0 && (
                    <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                      {c.unread}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
          <div className="flex flex-col">
            <div className="border-b border-border p-4">
              <p className="font-semibold">{active.name}</p>
            </div>
            <div className="flex-1 space-y-3 p-4">
              <div className="max-w-[70%] rounded-lg bg-muted px-4 py-2 text-sm">Bonjour, comment va Lucas en classe ?</div>
              <div className="ml-auto max-w-[70%] rounded-lg gradient-primary px-4 py-2 text-sm text-primary-foreground">
                Bonjour, Lucas progresse bien ce trimestre.
              </div>
            </div>
            <div className="flex gap-2 border-t border-border p-3">
              <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Écrivez un message..." />
              <Button size="icon" onClick={() => setText("")}><Send className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </TeacherPageShell>
  );
};

export default TeacherMessages;
